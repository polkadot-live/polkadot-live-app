// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/// Required imports.
import { AccountsController } from '@/controller/renderer/AccountsController';
import { APIsController } from '@/controller/renderer/APIsController';
import BigNumber from 'bignumber.js';
import { chainUnits } from '@/config/chains';
import { Config as ConfigRenderer } from '@/config/processes/renderer';
import { encodeAddress } from '@polkadot/util-crypto';
import { ExtrinsicsController } from '@/controller/renderer/ExtrinsicsController';
import {
  fetchBalanceForAccount,
  fetchNominatingDataForAccount,
  fetchNominationPoolDataForAccount,
} from '@/utils/AccountUtils';
import {
  importAccountSubscriptions,
  importIntervalTasks,
} from '@app/utils/ImportUtils';
import { getApiInstanceOrThrow, handleApiDisconnects } from '@/utils/ApiUtils';
import { isObject, u8aConcat } from '@polkadot/util';
import { planckToUnit, rmCommas } from '@w3ux/utils';
import { SubscriptionsController } from '@/controller/renderer/SubscriptionsController';
import { IntervalsController } from '@/controller/renderer/IntervalsController';
import { TaskOrchestrator } from '@/orchestrators/TaskOrchestrator';

/// Main window contexts.
import { useAddresses } from '@app/contexts/main/Addresses';
import { useAppSettings } from '@app/contexts/main/AppSettings';
import { useBootstrapping } from '@app/contexts/main/Bootstrapping';
import { useChains } from '@app/contexts/main/Chains';
import { useEffect } from 'react';
import { useEvents } from '@app/contexts/main/Events';
import { useManage } from '@app/contexts/main/Manage';
import { useSubscriptions } from '@app/contexts/main/Subscriptions';
import { useIntervalSubscriptions } from '@app/contexts/main/IntervalSubscriptions';
import { useDataBackup } from '@app/contexts/main/DataBackup';

/// Type imports.
import type { ActiveReferendaInfo } from '@/types/openGov';
import type { AnyData } from '@/types/misc';
import type { EventCallback } from '@/types/reporter';
import type { ExportResult, ImportResult } from '@/types/backup';
import type {
  IntervalSubscription,
  SubscriptionTask,
} from '@/types/subscriptions';

export const useMainMessagePorts = () => {
  /// Main renderer contexts.
  const { importAddress, removeAddress, setAddresses } = useAddresses();
  const { addChain } = useChains();
  const { updateEventsOnAccountRename } = useEvents();
  const { syncImportWindow, syncOpenGovWindow } = useBootstrapping();

  const {
    updateRenderedSubscriptions,
    setRenderedSubscriptions,
    tryAddIntervalSubscription,
    tryRemoveIntervalSubscription,
    tryUpdateDynamicIntervalTask,
  } = useManage();

  const {
    handleDockedToggle,
    handleToggleSilenceOsNotifications,
    handleToggleShowDebuggingSubscriptions,
    handleToggleEnableAutomaticSubscriptions,
    handleToggleEnablePolkassemblyApi,
    handleToggleKeepOutdatedEvents,
    handleToggleHideDockIcon,
  } = useAppSettings();

  const { setAccountSubscriptions, updateAccountNameInTasks, updateTask } =
    useSubscriptions();

  const {
    addIntervalSubscription,
    removeIntervalSubscription,
    updateIntervalSubscription,
  } = useIntervalSubscriptions();

  const { importAddressData, importEventData } = useDataBackup();

  /**
   * @name setSubscriptionsAndChainConnections
   * @summary Set subscription data React state.
   */
  const setSubscriptionsState = () => {
    // Set account subscriptions data for rendering.
    setAccountSubscriptions(
      SubscriptionsController.getAccountSubscriptions(
        AccountsController.accounts
      )
    );

    // Report chain connections to UI.
    for (const apiData of APIsController.getAllFlattenedAPIData()) {
      addChain(apiData);
    }
  };

  /**
   * @name handleImportAddress
   * @summary Imports a new account when a message is received from `import` window.
   */
  const handleImportAddress = async (ev: MessageEvent, fromBackup: boolean) => {
    const { chainId, source, address, name } = ev.data.data;

    // Add address to accounts controller.
    let account =
      AccountsController.add(chainId, source, address, name) || undefined;

    // Unsubscribe all tasks if the account exists and is being re-imported.
    if (fromBackup && !account) {
      account = AccountsController.get(chainId, address);

      if (account) {
        await AccountsController.removeAllSubscriptions(account);
        const allTasks = SubscriptionsController.getAllSubscriptionsForAccount(
          account,
          'disable'
        );

        for (const task of allTasks) {
          updateTask('account', task, task.account?.address);
          updateRenderedSubscriptions(task);

          await window.myAPI.sendSubscriptionTask({
            action: 'subscriptions:account:update',
            data: {
              serAccount: JSON.stringify(account.flatten()),
              serTask: JSON.stringify(task),
            },
          });
        }
      }
    }

    // Return if account already exists and isn't being re-imported.
    if (!account) {
      return;
    }

    // Fetch account data from network.
    const isOnline: boolean =
      (await window.myAPI.sendConnectionTaskAsync({
        action: 'connection:getStatus',
        data: null,
      })) || false;

    if (isOnline) {
      await fetchBalanceForAccount(account);
      await fetchNominationPoolDataForAccount(account);
      await fetchNominatingDataForAccount(account);
    }

    // Subscribe new account to all possible subscriptions if setting enabled.
    if (account.queryMulti !== null && !fromBackup) {
      const tasks = SubscriptionsController.getAllSubscriptionsForAccount(
        account,
        'enable'
      );

      // Update persisted state and React state for tasks.
      for (const task of tasks) {
        await window.myAPI.sendSubscriptionTask({
          action: 'subscriptions:account:update',
          data: {
            serAccount: JSON.stringify(account.flatten()),
            serTask: JSON.stringify(task),
          },
        });

        updateTask('account', task, task.account?.address);
        updateRenderedSubscriptions(task);
      }

      // Subscribe to tasks if app setting enabled.
      !fromBackup &&
        ConfigRenderer.enableAutomaticSubscriptions &&
        (await TaskOrchestrator.subscribeTasks(tasks, account.queryMulti));

      // Update React subscriptions state.
      setSubscriptionsState();
    }

    // Add account to address context state.
    await importAddress(chainId, source, address, name, fromBackup);

    // Send message back to import window to reset account's processing flag.
    ConfigRenderer.portToImport?.postMessage({
      task: 'import:account:processing',
      data: {
        address,
        source,
        status: false,
      },
    });

    // Analytics.
    window.myAPI.umamiEvent('account-import', { source, chainId });
  };

  /**
   * @name handleRemoveAddress
   * @summary Removes an account a message is received from `import` window.
   *
   * Also called when deleting an account.
   */
  const handleRemoveAddress = async (ev: MessageEvent) => {
    const { address, chainId } = ev.data.data;

    // Retrieve the account.
    const account = AccountsController.get(chainId, address);

    if (!account) {
      console.log('Account could not be fetched, probably not imported yet');
      return;
    }

    // Unsubscribe from all active tasks.
    await AccountsController.removeAllSubscriptions(account);

    // Remove account from controller and store.
    AccountsController.remove(chainId, address);

    // Remove address from context.
    await removeAddress(chainId, address);

    // Update account subscriptions data.
    setAccountSubscriptions(
      SubscriptionsController.getAccountSubscriptions(
        AccountsController.accounts
      )
    );

    // Disconnect from any API instances that are not currently needed.
    await handleApiDisconnects();

    // Report chain connections to UI.
    for (const apiData of APIsController.getAllFlattenedAPIData()) {
      addChain(apiData);
    }

    // Transition away from rendering toggles.
    setRenderedSubscriptions({ type: '', tasks: [] });

    // Analytics.
    const { source } = account;
    window.myAPI.umamiEvent('account-remove', { source, chainId });
  };

  /**
   * @name handleRenameAccount
   * @summary Rename an account managed by the accounts controller and update state.
   */
  const handleRenameAccount = async (ev: MessageEvent) => {
    const { address, chainId, newName } = ev.data.data;
    const account = AccountsController.get(chainId, address);

    if (!account) {
      // Account not found in controller.
      console.log('account not imported');
      return;
    }

    // Set new account name and persist new account data to storage.
    account.name = newName;
    await AccountsController.set(chainId, account);

    // Update account react state.
    setAddresses(AccountsController.getAllFlattenedAccountData());

    // Update subscription task react state.
    updateAccountNameInTasks(address, newName);

    // The updated events will be sent back to the renderer for updating React state.
    const serialized = (await window.myAPI.sendEventTaskAsync({
      action: 'events:update:accountName',
      data: { address, newName },
    })) as string;

    // Update events state.
    const updated: EventCallback[] = JSON.parse(serialized);
    updated.length > 0 && updateEventsOnAccountRename(updated, chainId);
  };

  /// Utility to post message to settings window.
  const postToSettings = (res: boolean, text: string) => {
    ConfigRenderer.portToSettings?.postMessage({
      task: 'settings:render:toast',
      data: { success: res, text },
    });
  };

  /**
   * @name handleDataExport
   * @summary Write Polkadot Live data to a file.
   */
  const handleDataExport = async () => {
    const { result, msg }: ExportResult = await window.myAPI.exportAppData();

    // Render toastify message in settings window.
    switch (msg) {
      case 'success': {
        postToSettings(result, 'Data exported successfully.');
        break;
      }
      case 'error': {
        postToSettings(result, 'Data export error.');
        break;
      }
      case 'canceled': {
        // Don't do anything on cancel.
        break;
      }
      case 'executing': {
        postToSettings(result, 'Export dialog is already open.');
        break;
      }
      default: {
        throw new Error('Message not recognized');
      }
    }
  };

  /**
   * @name handleDataImport
   * @summary Import and process Polkadot Live data from a backup.
   */
  const handleDataImport = async () => {
    const response: ImportResult = await window.myAPI.importAppData();

    switch (response.msg) {
      case 'success': {
        // Broadcast importing flag.
        window.myAPI.relayModeFlag('isImporting', true);

        try {
          if (!response.data) {
            throw new Error('No import data.');
          }

          // Import serialized data.
          const { serialized: s } = response.data;
          await importAddressData(s, handleImportAddress, handleRemoveAddress);
          await importEventData(s);

          // Interval subscriptions.
          await importIntervalTasks(
            s,
            tryAddIntervalSubscription,
            tryUpdateDynamicIntervalTask,
            addIntervalSubscription,
            updateIntervalSubscription
          );

          // Account subscriptions.
          await importAccountSubscriptions(
            s,
            updateRenderedSubscriptions,
            setAccountSubscriptions
          );

          postToSettings(response.result, 'Data imported successfully.');
        } catch (err) {
          postToSettings(false, 'Error parsing JSON.');
        }

        // Broadcast importing flag.
        window.myAPI.relayModeFlag('isImporting', false);
        break;
      }
      case 'canceled': {
        // Don't do anything on cancel.
        break;
      }
      case 'error': {
        postToSettings(response.result, 'Data import error.');
        break;
      }
      default: {
        throw new Error('Message not recognized');
      }
    }
  };

  /**
   * @name handleActionTxInit
   * @summary Initialize extrinsics controller with tx data.
   */
  const handleActionTxInit = async (ev: MessageEvent) => {
    const { chainId, from, nonce, pallet, method, args, eventUid } =
      ev.data.data;

    await ExtrinsicsController.new(
      chainId,
      from,
      nonce,
      pallet,
      method,
      args,
      eventUid
    );
  };

  /**
   * @name handleTxVaultSubmit
   * @summary Set signature and submit transaction.
   */
  const handleTxVaultSubmit = (ev: MessageEvent) => {
    const { signature } = ev.data.data;

    ExtrinsicsController.setSignature(signature);
    ExtrinsicsController.submit();
  };

  /**
   * @name handleGetTracks
   * @summary Use API to get a network's OpenGov tracks.
   */
  const handleGetTracks = async (ev: MessageEvent) => {
    const { chainId } = ev.data.data;
    const { api } = await getApiInstanceOrThrow(chainId, 'Error');
    const result = api.consts.referenda.tracks.toHuman();

    ConfigRenderer.portToOpenGov?.postMessage({
      task: 'openGov:tracks:receive',
      data: { result },
    });
  };

  /**
   * @name handleGetReferenda
   * @summary Use API to get a network's OpenGov referenda.
   */
  const handleGetReferenda = async (ev: MessageEvent) => {
    // Make API call to fetch referenda entries.
    const { chainId } = ev.data.data;
    const { api } = await getApiInstanceOrThrow(chainId, 'Error');
    const results = await api.query.referenda.referendumInfoFor.entries();

    // Populate referenda map.
    const activeReferenda: ActiveReferendaInfo[] = [];

    for (const [storageKey, storage] of results) {
      const info: AnyData = storage.toHuman();

      if (isObject(info) && 'Ongoing' in info) {
        // Instantiate and push next referenda to state.
        const next: ActiveReferendaInfo = {
          referendaId: parseInt(
            rmCommas((storageKey.toHuman() as string[])[0])
          ),
          Ongoing: {
            ...info.Ongoing,
          },
        };

        // If `deciding` is null, the referendum is in the Prepare period.
        if (next.Ongoing.deciding) {
          activeReferenda.push(next);
        }
      }
    }

    // Serialize data before sending to open gov window.
    const json = JSON.stringify(activeReferenda);

    ConfigRenderer.portToOpenGov?.postMessage({
      task: 'openGov:referenda:receive',
      data: { json },
    });
  };

  /**
   * @name handleInitTreasury
   * @summary Use API to get treasury data for OpenGov window.
   */
  const handleInitTreasury = async (ev: MessageEvent) => {
    const { chainId } = ev.data.data;
    const { api } = await getApiInstanceOrThrow(chainId, 'Error');

    // Get raw treasury public key.
    const EMPTY_U8A_32 = new Uint8Array(32);
    const publicKey = u8aConcat(
      'modl',
      api.consts.treasury.palletId
        ? api.consts.treasury.palletId.toU8a(true)
        : 'py/trsry',
      EMPTY_U8A_32
    ).subarray(0, 32);

    // Get free balance.
    const prefix: number = chainId === 'Polkadot' ? 0 : 2; // Kusama prefix 2
    const encoded = encodeAddress(publicKey, prefix);
    const result: AnyData = (await api.query.system.account(encoded)).toHuman();
    const { free } = result.data;
    const freeBalance: string = planckToUnit(
      new BigNumber(rmCommas(String(free))),
      chainUnits(chainId)
    ).toString();

    // Get next burn.
    const burn = api.consts.treasury.burn;
    const toBurn = new BigNumber(burn.toString())
      .dividedBy(Math.pow(10, 6))
      .multipliedBy(new BigNumber(rmCommas(String(free))));
    const nextBurn = planckToUnit(toBurn, chainUnits(chainId)).toString();

    // Get to be awarded.
    const [approvals, proposals] = await Promise.all([
      api.query.treasury.approvals(),
      api.query.treasury.proposals.entries(),
    ]);

    let toBeAwarded = new BigNumber(0);
    const toBeAwardedProposalIds = approvals.toHuman() as string[];

    for (const [rawProposalId, rawProposalData] of proposals) {
      const proposalId: string = (rawProposalId.toHuman() as [string])[0];
      if (toBeAwardedProposalIds.includes(proposalId)) {
        const proposal: AnyData = rawProposalData.toHuman();
        toBeAwarded = toBeAwarded.plus(
          new BigNumber(rmCommas(String(proposal.value)))
        );
      }
    }

    const toBeAwardedAsStr = planckToUnit(
      toBeAwarded,
      chainUnits(chainId)
    ).toString();

    // Spend period + elapsed spend period.
    const lastHeader = await api.rpc.chain.getHeader();
    const blockHeight = lastHeader.number.toNumber();

    const spendPeriodAsStr = String(api.consts.treasury.spendPeriod.toHuman());
    const spendPeriodBn = new BigNumber(rmCommas(String(spendPeriodAsStr)));
    const spendPeriodElapsedBlocksAsStr = new BigNumber(blockHeight)
      .mod(spendPeriodBn)
      .toString();

    ConfigRenderer.portToOpenGov?.postMessage({
      task: 'openGov:treasury:set',
      data: {
        publicKey,
        freeBalance,
        nextBurn,
        toBeAwardedAsStr,
        spendPeriodAsStr,
        spendPeriodElapsedBlocksAsStr,
      },
    });
  };

  /**
   * @name handleAddInterval
   * @summary Add an interval subscription to the intervals controller.
   */
  const handleAddInterval = async (ev: MessageEvent) => {
    const { task: serialized } = ev.data.data;
    const task: IntervalSubscription = JSON.parse(serialized);

    // Add task to interval controller.
    IntervalsController.insertSubscription({ ...task });

    // Add task to dynamic manage state if necessary.
    tryAddIntervalSubscription({ ...task });

    // Add task to React state for rendering.
    addIntervalSubscription({ ...task });

    // Persist task to store.
    await window.myAPI.sendIntervalTask({
      action: 'interval:task:add',
      data: { serialized: JSON.stringify(task) },
    });
  };

  /**
   * @name handleRemoveInterval
   * @summary Remove an interval subscription from the intervals controller.
   */
  const handleRemoveInterval = async (ev: MessageEvent) => {
    const { task: serialized } = ev.data.data;
    const task: IntervalSubscription = JSON.parse(serialized);

    // Remove task from interval controller.
    IntervalsController.removeSubscription({ ...task });

    // Remove task from dynamic manage state if necessary.
    tryRemoveIntervalSubscription({ ...task });

    // Remove task from React state for rendering.
    removeIntervalSubscription({ ...task });

    // Remove task from store.
    await window.myAPI.sendIntervalTask({
      action: 'interval:task:remove',
      data: { serialized: JSON.stringify(task) },
    });
  };

  /**
   * @name handleAddIntervals
   * @summary Add an array of interval subscriptions to the main renderer state.
   */
  const handleAddIntervals = async (ev: MessageEvent) => {
    const { tasks } = ev.data.data;
    const parsed: IntervalSubscription[] = JSON.parse(tasks);

    // Update managed tasks in intervals controller.
    IntervalsController.insertSubscriptions(parsed);

    // Update React and store state.
    for (const task of parsed) {
      // Add task to dynamic manage state if necessary.
      tryAddIntervalSubscription({ ...task });

      // Add task to React state for rendering.
      addIntervalSubscription({ ...task });

      // Persist task to store.
      await window.myAPI.sendIntervalTask({
        action: 'interval:task:add',
        data: { serialized: JSON.stringify(task) },
      });
    }
  };

  /**
   * @name handleRemoveIntervals
   * @summary Remove an array of interval subscriptions from the main renderer state.
   */
  const handleRemoveIntervals = async (ev: MessageEvent) => {
    const { tasks } = ev.data.data;
    const parsed: IntervalSubscription[] = JSON.parse(tasks);

    // Update managed tasks in intervals controller.
    IntervalsController.removeSubscriptions(parsed);

    // Update React and store state.
    for (const task of parsed) {
      // Remove task from dynamic manage state if necessary.
      tryRemoveIntervalSubscription({ ...task });

      // Remove task from React state for rendering.
      removeIntervalSubscription({ ...task });

      // Remove task from store.
      await window.myAPI.sendIntervalTask({
        action: 'interval:task:remove',
        data: { serialized: JSON.stringify(task) },
      });
    }
  };

  /**
   * @name handleDebuggingSubscriptions
   * @summary Handle debugging subcscriptions when setting is toggled.
   */
  const handleDebuggingSubscriptions = async () => {
    handleToggleShowDebuggingSubscriptions();

    // Return if setting has been turned on.
    if (ConfigRenderer.showDebuggingSubscriptions) {
      return;
    }

    // Unsubscribe from any active debugging subscriptions when setting turned off.
    for (const chainTasks of SubscriptionsController.getChainSubscriptions().values()) {
      const active = chainTasks
        .filter((t) => t.status === 'enable')
        .map((t) => ({ ...t, status: 'disable' }) as SubscriptionTask);

      if (active.length === 0) {
        continue;
      }

      // Update state.
      for (const activeTask of active) {
        await window.myAPI.sendSubscriptionTask({
          action: 'subscriptions:chain:update',
          data: { serTask: JSON.stringify(activeTask) },
        });
        updateTask('chain', activeTask);
        updateRenderedSubscriptions(activeTask);
      }

      // Unsubscribe from active debuggin tasks.
      await SubscriptionsController.subscribeChainTasks(active);
    }
  };

  /**
   * @name handleEnableAutomaticSubscriptions
   * @summary Handle toggling the handle automatic subscriptions setting.
   */
  const handleEnableAutomaticSubscriptions = () => {
    handleToggleEnableAutomaticSubscriptions();
  };

  /**
   * @name handleReceivedPort
   * @summary Determines whether the received port is for the `main` or `import` window and
   * sets up message handlers accordingly.
   */
  const handleReceivedPort = async (e: MessageEvent) => {
    console.log(`received port: ${e.data.target}`);

    switch (e.data.target) {
      case 'main-import:main': {
        ConfigRenderer.portToImport = e.ports[0];

        ConfigRenderer.portToImport.onmessage = async (ev: MessageEvent) => {
          // Message received from `import`.
          switch (ev.data.task) {
            case 'renderer:address:import': {
              await handleImportAddress(ev, false);
              break;
            }
            case 'renderer:address:remove': {
              await handleRemoveAddress(ev);
              break;
            }
            case 'renderer:address:delete': {
              await handleRemoveAddress(ev);
              break;
            }
            case 'renderer:account:rename': {
              await handleRenameAccount(ev);
              break;
            }
            default: {
              throw new Error(`Port task not recognized (${ev.data.task})`);
            }
          }
        };

        ConfigRenderer.portToImport.start();
        await syncImportWindow();
        break;
      }
      case 'main-action:main': {
        ConfigRenderer.portToAction = e.ports[0];

        ConfigRenderer.portToAction.onmessage = async (ev: MessageEvent) => {
          // Message received from `action`.
          switch (ev.data.task) {
            case 'renderer:tx:init': {
              console.log('> handle renderer:tx:init');
              await handleActionTxInit(ev);
              break;
            }
            case 'renderer:tx:vault:submit': {
              console.log('> handle renderer:tx:vault:submit');
              handleTxVaultSubmit(ev);
              break;
            }
            case 'renderer:tx:reset': {
              console.log('> handle renderer:tx:reset');
              ExtrinsicsController.reset();
              break;
            }
            default: {
              throw new Error(`Port task not recognized (${ev.data.task})`);
            }
          }
        };

        ConfigRenderer.portToAction.start();
        break;
      }
      case 'main-settings:main': {
        ConfigRenderer.portToSettings = e.ports[0];

        ConfigRenderer.portToSettings.onmessage = async (ev: MessageEvent) => {
          // Message received from `settings`.
          switch (ev.data.task) {
            case 'settings:execute:dockedWindow': {
              handleDockedToggle();
              break;
            }
            case 'settings:execute:showOnAllWorkspaces': {
              window.myAPI.sendSettingTask({
                action: 'settings:toggle:allWorkspaces',
                data: null,
              });
              break;
            }
            case 'settings:execute:silenceOsNotifications': {
              handleToggleSilenceOsNotifications();
              break;
            }
            case 'settings:execute:showDebuggingSubscriptions': {
              await handleDebuggingSubscriptions();
              break;
            }
            case 'settings:execute:enableAutomaticSubscriptions': {
              handleEnableAutomaticSubscriptions();
              break;
            }
            case 'settings:execute:enablePolkassembly': {
              handleToggleEnablePolkassemblyApi();
              break;
            }
            case 'settings:execute:keepOutdatedEvents': {
              handleToggleKeepOutdatedEvents();
              break;
            }
            case 'settings:execute:hideDockIcon': {
              handleToggleHideDockIcon();
              break;
            }
            case 'settings:execute:exportData': {
              await handleDataExport();
              break;
            }
            case 'settings:execute:importData': {
              await handleDataImport();
              break;
            }
            default: {
              throw new Error(`Port task not recognized (${ev.data.task})`);
            }
          }
        };

        ConfigRenderer.portToSettings.start();
        break;
      }
      case 'main-openGov:main': {
        ConfigRenderer.portToOpenGov = e.ports[0];

        ConfigRenderer.portToOpenGov.onmessage = async (ev: MessageEvent) => {
          // Message received from `openGov`.
          switch (ev.data.task) {
            case 'openGov:tracks:get': {
              await handleGetTracks(ev);
              break;
            }
            case 'openGov:referenda:get': {
              await handleGetReferenda(ev);
              break;
            }
            case 'openGov:treasury:init': {
              await handleInitTreasury(ev);
              break;
            }
            case 'openGov:interval:add': {
              await handleAddInterval(ev);
              break;
            }
            case 'openGov:interval:remove': {
              await handleRemoveInterval(ev);
              break;
            }
            case 'openGov:interval:add:multi': {
              await handleAddIntervals(ev);
              break;
            }
            case 'openGov:interval:remove:multi': {
              await handleRemoveIntervals(ev);
              break;
            }
            default: {
              throw new Error(`Port task not recognized (${ev.data.task})`);
            }
          }
        };

        ConfigRenderer.portToOpenGov.start();
        await syncOpenGovWindow();
        break;
      }
      default: {
        console.error('Something went wrong.');
        break;
      }
    }
  };

  useEffect(() => {
    /**
     * Provide `onmessage` function.
     */
    window.onmessage = handleReceivedPort;

    /**
     * Cleanup message listener.
     */
    return () => {
      window.removeEventListener('message', handleReceivedPort, false);
    };
  }, []);
};
