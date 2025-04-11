// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/// Dependencies.
import { getOnlineStatus } from '@ren/utils/CommonUtils';
import { AccountsController } from '@ren/controller/AccountsController';
import { APIsController as DedotAPIsController } from '@ren/controller/dedot/APIsController';
import { APIsController } from '@ren/controller/APIsController';
import BigNumber from 'bignumber.js';
import { chainUnits } from '@ren/config/chains';
import { Config as ConfigRenderer } from '@ren/config/processes/renderer';
import { ExtrinsicsController } from '@ren/controller/ExtrinsicsController';
import {
  fetchBalanceForAccount,
  fetchNominatingDataForAccount,
  fetchNominationPoolDataForAccount,
  getAddressChainId,
} from '@ren/utils/AccountUtils';
import { disconnectAPIs } from '@ren/utils/ApiUtils';
import { isObject } from '@polkadot/util';
import { planckToUnit, rmCommas } from '@w3ux/utils';
import { SubscriptionsController } from '@ren/controller/SubscriptionsController';
import { IntervalsController } from '@ren/controller/IntervalsController';
import { TaskOrchestrator } from '@ren/orchestrators/TaskOrchestrator';
import { concatU8a, encodeAddress, hexToU8a, stringToU8a } from 'dedot/utils';

/// Main window contexts.
import { useAddresses } from '@app/contexts/main/Addresses';
import { useAppSettings } from '@app/contexts/main/AppSettings';
import { useBootstrapping } from '@app/contexts/main/Bootstrapping';
import { useEffect } from 'react';
import { useEvents } from '@app/contexts/main/Events';
import { useManage } from '@app/contexts/main/Manage';
import { useSubscriptions } from '@app/contexts/main/Subscriptions';
import { useIntervalSubscriptions } from '@app/contexts/main/IntervalSubscriptions';
import { useDataBackup } from '@app/contexts/main/DataBackup';
import { useWalletConnect } from '@app/contexts/main/WalletConnect';

/// Types.
import type * as OG from '@polkadot-live/types/openGov';
import type { AnyData } from '@polkadot-live/types/misc';
import type { EventCallback } from '@polkadot-live/types/reporter';
import type { ExtrinsicInfo } from '@polkadot-live/types/tx';
import type {
  IntervalSubscription,
  SubscriptionTask,
} from '@polkadot-live/types/subscriptions';
import type { WcSelectNetwork } from '@polkadot-live/types/walletConnect';

// TODO: Move to WalletConnect file.
const WC_EVENT_ORIGIN = 'https://verify.walletconnect.org';

export const useMainMessagePorts = () => {
  /// Main renderer contexts.
  const { importAddress, removeAddress } = useAddresses();
  const { updateEventsOnAccountRename } = useEvents();
  const { syncOpenGovWindow } = useBootstrapping();
  const { exportDataToBackup, importDataFromBackup } = useDataBackup();

  const {
    connectWc,
    disconnectWcSession,
    fetchAddressesFromExistingSession,
    wcEstablishSessionForExtrinsic,
    wcSignExtrinsic,
    updateWcTxSignMap,
    verifySigningAccount,
  } = useWalletConnect();

  const {
    updateRenderedSubscriptions,
    setRenderedSubscriptions,
    tryAddIntervalSubscription,
    tryRemoveIntervalSubscription,
  } = useManage();

  const {
    handleDockedToggle,
    handleToggleSilenceOsNotifications,
    handleToggleSilenceExtrinsicOsNotifications,
    handleToggleShowDebuggingSubscriptions,
    handleToggleEnableAutomaticSubscriptions,
    handleToggleEnablePolkassemblyApi,
    handleToggleKeepOutdatedEvents,
    handleToggleHideDockIcon,
  } = useAppSettings();

  const { updateAccountNameInTasks, updateTask } = useSubscriptions();
  const { addIntervalSubscription, removeIntervalSubscription } =
    useIntervalSubscriptions();

  /**
   * @name handleImportAddress
   * @summary Imports a new account when a message is received from `import` window.
   */
  const handleImportAddress = async (ev: MessageEvent, fromBackup: boolean) => {
    try {
      window.myAPI.relaySharedState('isImportingAccount', true);
      const { chainId, source, address, name: accountName } = ev.data.data;

      // Add address to accounts controller.
      let account =
        AccountsController.add(chainId, source, address, accountName) ||
        undefined;

      // Unsubscribe all tasks if the account exists and is being re-imported.
      if (fromBackup && !account) {
        account = AccountsController.get(chainId, address);

        if (account) {
          await AccountsController.removeAllSubscriptions(account);
          const allTasks =
            SubscriptionsController.getAllSubscriptionsForAccount(
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
        window.myAPI.relaySharedState('isImportingAccount', false);
        return;
      }

      // Fetch account data from network.
      const isOnline: boolean = await getOnlineStatus();
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
        SubscriptionsController.syncAccountSubscriptionsState();
      }

      // Add account to address context state.
      await importAddress(chainId, source, address, accountName, fromBackup);

      // Send message back to import window to reset account's processing flag.
      ConfigRenderer.portToImport?.postMessage({
        task: 'import:account:processing',
        data: { address, source, status: false, success: true, accountName },
      });

      window.myAPI.relaySharedState('isImportingAccount', false);
      window.myAPI.umamiEvent('account-import', { source, chainId });
    } catch (err) {
      const { address, source, name: accountName } = ev.data.data;

      window.myAPI.relaySharedState('isImportingAccount', false);
      ConfigRenderer.portToImport?.postMessage({
        task: 'import:account:processing',
        data: { address, source, status: false, success: false, accountName },
      });
    }
  };

  /**
   * @name handleRemoveAddress
   * @summary Removes an account when a message is received from `import` window.
   *
   * Also called when deleting an account.
   */
  const handleRemoveAddress = async (ev: MessageEvent) => {
    try {
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
      SubscriptionsController.syncAccountSubscriptionsState();

      // Disconnect from any API instances that are not currently needed.
      await disconnectAPIs();

      // Transition away from rendering toggles.
      setRenderedSubscriptions({ type: '', tasks: [] });

      // Analytics.
      const { source } = account;
      window.myAPI.umamiEvent('account-remove', { source, chainId });
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * @name handleRenameAccount
   * @summary Rename an account managed by the accounts controller and update state.
   */
  const handleRenameAccount = async (ev: MessageEvent) => {
    const { address, chainId, newName } = ev.data.data;
    const account = AccountsController.get(chainId, address);

    if (account) {
      // Set new account name and persist new account data to storage.
      account.name = newName;
      await AccountsController.set(chainId, account);

      // Update account react state.
      AccountsController.syncState();

      // Update subscription task react state.
      updateAccountNameInTasks(address, newName);
    }

    // The updated events will be sent back to the renderer for updating React state.
    const serialized = (await window.myAPI.sendEventTaskAsync({
      action: 'events:update:accountName',
      data: { address, newName },
    })) as string;

    // Update events state.
    const updated: EventCallback[] = JSON.parse(serialized);
    updated.length > 0 && updateEventsOnAccountRename(updated, chainId);

    // Update account name in extrinsics window.
    ConfigRenderer.portToAction?.postMessage({
      task: 'action:account:rename',
      data: {
        address,
        chainId: getAddressChainId(address),
        newName,
      },
    });
  };

  /**
   * @name handleWcConnect
   * @summary Connect to a WalletConnect session to fetch addresses.
   */
  const handleConnectWc = async (ev: MessageEvent) => {
    const wcNetworks: WcSelectNetwork[] = JSON.parse(ev.data.data.networks);
    await connectWc(wcNetworks);
  };

  /**
   * @name handleDisconnectWc
   * @summary Disconnect from an established WalletConnect session.
   */
  const handleDisconnectWc = async () => await disconnectWcSession();

  /**
   * @name handleFetchWcSessionAddresses
   * @summary Fetch addresses from an established WalletConnect session.
   */
  const handleFetchWcSessionAddresses = () =>
    fetchAddressesFromExistingSession();

  /**
   * @name handleActionTxInit
   * @summary Initialize extrinsics controller with tx data.
   */
  const handleActionTxInit = async (ev: MessageEvent) => {
    const info: ExtrinsicInfo = JSON.parse(ev.data.data);
    await ExtrinsicsController.new(info);
  };

  /**
   * @name handleTxBuild
   * @summary Build and cache an extrinsic payload.
   */
  const handleTxBuild = async (ev: MessageEvent) => {
    const info: ExtrinsicInfo = JSON.parse(ev.data.data);
    await ExtrinsicsController.build(info);
  };

  /**
   * @name handleTxVaultSubmit
   * @summary Set signature and submit transaction.
   */
  const handleTxVaultSubmit = (ev: MessageEvent) => {
    const { info: serialized } = ev.data.data;
    const info: ExtrinsicInfo = JSON.parse(serialized);
    ExtrinsicsController.submit(info);
  };
  /**
   * @name handleTxMockSubmit
   * @summary Mock an extrinsic submission for UI testing.
   */
  const handleTxMockSubmit = (ev: MessageEvent) => {
    const { info: serialized } = ev.data.data;
    const info: ExtrinsicInfo = JSON.parse(serialized);
    ExtrinsicsController.mockSubmit(info);
  };

  /**
   * @name handleTxDelete
   * @summary Delete a cached transaction.
   */
  const handleTxDelete = (ev: MessageEvent) => {
    const { txId } = ev.data.data;
    ExtrinsicsController.deleteTx(txId);
  };

  /**
   * @name handleGetTracks
   * @summary Use API to get a network's OpenGov tracks.
   */
  const handleGetTracks = async (ev: MessageEvent) => {
    const { chainId } = ev.data.data;

    try {
      const { api } = await APIsController.getConnectedApiOrThrow(chainId);
      const result = api.consts.referenda.tracks.toHuman();

      ConfigRenderer.portToOpenGov?.postMessage({
        task: 'openGov:tracks:receive',
        data: { result, chainId },
      });
    } catch (e) {
      console.error(e);
      ConfigRenderer.portToOpenGov?.postMessage({
        task: 'openGov:tracks:receive',
        data: { result: null, chainId },
      });
    }
  };

  /**
   * @name handleGetReferenda
   * @summary Use API to get a network's OpenGov referenda.
   */
  const handleGetReferenda = async (ev: MessageEvent) => {
    try {
      // Make API call to fetch referenda entries.
      const { chainId } = ev.data.data;
      const { api } = await APIsController.getConnectedApiOrThrow(chainId);
      const results = await api.query.referenda.referendumInfoFor.entries();

      // Populate referenda map.
      const allReferenda: OG.ReferendaInfo[] = [];

      for (const [storageKey, storage] of results) {
        const human: AnyData = storage.toHuman();
        const refId = Number(rmCommas(String(storageKey.toHuman())));

        if (isObject(human)) {
          if ('Approved' in human) {
            const isNull = human.Approved[1] === null;
            const block = human.Approved[0];
            const who = isNull ? null : human.Approved[1].who;
            const amount = isNull ? null : human.Approved[1].amount;
            const info: OG.RefApproved = { block, who, amount };

            allReferenda.push({ refId, refStatus: 'Approved', info });
          } else if ('Cancelled' in human) {
            const isNull = human.Cancelled[1] === null;
            const block = human.Cancelled[0];
            const who = isNull ? null : human.Cancelled[1].who;
            const amount = isNull ? null : human.Cancelled[1].amount;
            const info: OG.RefCancelled = { block, who, amount };

            allReferenda.push({ refId, refStatus: 'Cancelled', info });
          } else if ('Rejected' in human) {
            const block = human.Rejected[0];
            const who = human.Rejected[1].who;
            const amount = human.Rejected[1].amount;
            const info: OG.RefRejected = { block, who, amount };

            allReferenda.push({ refId, refStatus: 'Rejected', info });
          } else if ('TimedOut' in human) {
            const block = human.TimedOut[0];
            const who = human.TimedOut[1].who;
            const amount = human.TimedOut[1].amount;
            const info: OG.RefTimedOut = { block, who, amount };

            allReferenda.push({ refId, refStatus: 'TimedOut', info });
          } else if ('Ongoing' in human) {
            // In Queue
            if (human.Ongoing.inQueue === true) {
              const info: OG.RefOngoing = { ...human.Ongoing };
              allReferenda.push({ refId, refStatus: 'Queueing', info });
            }
            // Preparing
            else if (human.Ongoing.deciding === null) {
              const info: OG.RefPreparing = { ...human.Ongoing };
              allReferenda.push({ refId, refStatus: 'Preparing', info });
            }
            // Deciding
            else if (human.Ongoing.deciding.confirming === null) {
              const info: OG.RefDeciding = { ...human.Ongoing };
              allReferenda.push({ refId, refStatus: 'Deciding', info });
            }
            // Confirming
            else if (human.Ongoing.deciding.confirming !== null) {
              const info: OG.RefConfirming = { ...human.Ongoing };
              allReferenda.push({ refId, refStatus: 'Confirming', info });
            }
          } else if ('Killed' in human) {
            const block = human.Killed;
            const info: OG.RefKilled = { block };
            allReferenda.push({ refId, refStatus: 'Killed', info });
          }
        }
      }

      // Serialize data before sending to open gov window.
      ConfigRenderer.portToOpenGov?.postMessage({
        task: 'openGov:referenda:receive',
        data: { json: JSON.stringify(allReferenda) },
      });
    } catch (e) {
      console.error(e);
      ConfigRenderer.portToOpenGov?.postMessage({
        task: 'openGov:referenda:receive',
        data: { json: null },
      });
    }
  };

  /**
   * @name handleInitTreasury
   * @summary Use API to get treasury data for OpenGov window.
   */
  const handleInitTreasury = async (ev: MessageEvent) => {
    try {
      const { chainId } = ev.data.data;
      const api = (
        await DedotAPIsController.getConnectedApiOrThrow(chainId)
      ).getApi();

      const EMPTY_U8A_32 = new Uint8Array(32);
      const hexPalletId = api.consts.treasury.palletId;
      const u8aPalleId = hexPalletId
        ? hexToU8a(hexPalletId)
        : stringToU8a('py/trsry');

      const publicKey = concatU8a(
        stringToU8a('modl'),
        u8aPalleId,
        EMPTY_U8A_32
      ).subarray(0, 32);

      // Get free balance.
      const prefix: number = api.consts.system.ss58Prefix;
      const encoded = encodeAddress(publicKey, prefix);
      const result = await api.query.system.account(encoded);

      const { free } = result.data;
      const freeBalance: string = planckToUnit(free, chainUnits(chainId));

      // Get next burn.
      const burn = api.consts.treasury.burn;
      const toBurn = new BigNumber(burn)
        .dividedBy(Math.pow(10, 6))
        .multipliedBy(new BigNumber(free.toString()));

      const nextBurn = planckToUnit(
        toBurn.toString(),
        chainUnits(chainId)
      ).toString();

      // Get to be awarded.
      const [approvals, proposals] = await Promise.all([
        api.query.treasury.approvals(),
        api.query.treasury.proposals.entries(),
      ]);

      let toBeAwarded = 0n;
      for (const [proposalId, proposalData] of proposals) {
        if (approvals.includes(proposalId)) {
          toBeAwarded += proposalData.value;
        }
      }

      const strToBeAwarded = planckToUnit(toBeAwarded, chainUnits(chainId));

      // Spend period + elapsed spend period.
      const spendPeriod = api.consts.treasury.spendPeriod;
      const lastHeader = await api.rpc.chain_getHeader();
      const dedotBlockHeight = lastHeader?.number;

      let spendPeriodElapsedBlocksAsStr = '0';
      if (dedotBlockHeight) {
        spendPeriodElapsedBlocksAsStr = new BigNumber(dedotBlockHeight)
          .mod(new BigNumber(spendPeriod))
          .toString();
      }

      ConfigRenderer.portToOpenGov?.postMessage({
        task: 'openGov:treasury:set',
        data: {
          publicKey,
          freeBalance,
          nextBurn,
          toBeAwardedAsStr: strToBeAwarded,
          spendPeriodAsStr: spendPeriod.toString(),
          spendPeriodElapsedBlocksAsStr,
        },
      });
    } catch (e) {
      ConfigRenderer.portToOpenGov?.postMessage({
        task: 'openGov:treasury:set',
        data: null,
      });
    }
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
    // TODO: May need to handle WalletConnect messages here.
    // For now, don't do any further processing if message is from WalletConnect.
    if (e.origin === WC_EVENT_ORIGIN) {
      console.log('> WalletConnect event received:');
      console.log(e);
      return;
    }

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
            case 'renderer:wc:connect': {
              await handleConnectWc(ev);
              break;
            }
            case 'renderer:wc:disconnect': {
              await handleDisconnectWc();
              break;
            }
            case 'renderer:wc:fetch': {
              handleFetchWcSessionAddresses();
              break;
            }
            default: {
              throw new Error(`Port task not recognized (${ev.data.task})`);
            }
          }
        };

        ConfigRenderer.portToImport.start();
        break;
      }
      case 'main-action:main': {
        ConfigRenderer.portToAction = e.ports[0];

        ConfigRenderer.portToAction.onmessage = async (ev: MessageEvent) => {
          // Message received from `action`.
          switch (ev.data.task) {
            case 'renderer:tx:init': {
              await handleActionTxInit(ev);
              break;
            }
            case 'renderer:tx:build': {
              await handleTxBuild(ev);
              break;
            }
            case 'renderer:tx:mock:submit': {
              handleTxMockSubmit(ev);
              break;
            }
            case 'renderer:tx:vault:submit': {
              console.log('> handle renderer:tx:vault:submit');
              handleTxVaultSubmit(ev);
              break;
            }
            case 'renderer:tx:delete': {
              handleTxDelete(ev);
              break;
            }
            case 'renderer:wc:connect:action': {
              const { target, chainId } = ev.data.data;
              await wcEstablishSessionForExtrinsic(target, chainId);
              break;
            }
            case 'renderer:wc:sign': {
              const { info: serialized } = ev.data.data;
              const info: ExtrinsicInfo = JSON.parse(serialized);
              await wcSignExtrinsic(info);
              break;
            }
            case 'renderer:wc:sign:cancel': {
              const { txId } = ev.data.data;
              updateWcTxSignMap(txId, false);
              break;
            }
            case 'renderer:wc:verify:account': {
              const { target, chainId } = ev.data.data;
              await verifySigningAccount(target, chainId);
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
            case 'settings:execute:silenceExtrinsicsOsNotifications': {
              handleToggleSilenceExtrinsicOsNotifications();
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
              await exportDataToBackup();
              break;
            }
            case 'settings:execute:importData': {
              await importDataFromBackup(
                handleImportAddress,
                handleRemoveAddress
              );
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
