// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as MainCtx from '@ren/contexts/main';
import * as Core from '@polkadot-live/core';
import {
  ConfigRenderer,
  disconnectAPIs,
  AccountsController,
  APIsController,
  ExtrinsicsController,
  IntervalsController,
  SubscriptionsController,
  TaskOrchestrator,
} from '@polkadot-live/core';
import { useEffect } from 'react';
import { WC_EVENT_ORIGIN } from '@polkadot-live/consts/walletConnect';
import {
  useAddresses,
  useAppSettings,
  useChainEvents,
  useConnections,
  useEvents,
  useIntervalSubscriptions,
  useManage,
  useSubscriptions,
} from '@polkadot-live/contexts';

import type * as OG from '@polkadot-live/types/openGov';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ClientTypes } from '@polkadot-live/types/apis';
import type { DedotClient } from 'dedot';
import type { EventCallback } from '@polkadot-live/types/reporter';
import type { ExtrinsicInfo } from '@polkadot-live/types/tx';
import type {
  EncodedAccount,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type {
  IntervalSubscription,
  SubscriptionTask,
} from '@polkadot-live/types/subscriptions';
import type { PalletReferendaTrackDetails } from '@dedot/chaintypes/substrate';
import type { SettingItem } from '@polkadot-live/types/settings';
import type { WcSelectNetwork } from '@polkadot-live/types/walletConnect';

export const useMainMessagePorts = () => {
  const { getOnlineMode } = useConnections();
  const { cacheGet, toggleSetting } = useAppSettings();
  const { importAddress, removeAddress } = useAddresses();
  const { addSubsForRef, removeSubsForRef } = useChainEvents();
  const { updateAccountNameInTasks } = useSubscriptions();
  const { exportDataToBackup, importDataFromBackup } = MainCtx.useDataBackup();
  const { updateEventsOnAccountRename } = useEvents();
  const { ledgerSignSubmit } = MainCtx.useLedgerSigner();
  const { handleInitTreasury } = MainCtx.useTreasuryApi();
  const { addIntervalSubscription, removeIntervalSubscriptions } =
    useIntervalSubscriptions();

  const {
    connectWc,
    disconnectWcSession,
    fetchAddressesFromExistingSession,
    postApprovedResult,
    setSigningChain,
    tryCacheSession,
    wcEstablishSessionForExtrinsic,
    wcSignExtrinsic,
    updateWcTxSignMap,
    verifySigningAccount,
  } = MainCtx.useWalletConnect();
  const { setRenderedSubscriptions } = useManage();
  const { removeAllForAccount } = useChainEvents();

  /**
   * @name handleImportAddress
   * @summary Imports a new account when a message is received from `import` window.
   */
  const handleImportAddress = async (ev: MessageEvent, fromBackup: boolean) => {
    try {
      window.myAPI.relaySharedState('account:importing', true);
      const { serEncodedAccount, serGenericAccount } = ev.data.data;
      const encoded: EncodedAccount = JSON.parse(serEncodedAccount);
      const generic: ImportedGenericAccount = JSON.parse(serGenericAccount);
      const { address, alias, chainId } = encoded;
      const { source } = generic;

      // Add address to accounts controller.
      let account = AccountsController.add(encoded, source) || undefined;

      // Unsubscribe all tasks if the account exists and is being re-imported.
      if (fromBackup && !account) {
        account = AccountsController.get(chainId, address);

        if (account) {
          // Update account name with one in backup file.
          if (alias !== account.name) {
            account.name = alias;
            await AccountsController.set(account);
          }

          await AccountsController.removeAllSubscriptions(account);
          const allTasks = SubscriptionsController.buildSubscriptions(
            account,
            'disable'
          );

          for (const task of allTasks) {
            SubscriptionsController.updateTaskState(task);
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
        window.myAPI.relaySharedState('account:importing', false);
        return;
      }

      // Sync managed account data if online.
      if (getOnlineMode()) {
        const res = await APIsController.getConnectedApiOrThrow(chainId);
        const api = res.getApi();
        await AccountsController.syncAccount(account, api);
      }

      // Subscribe new account to all possible subscriptions if setting enabled.
      if (account.queryMulti !== null && !fromBackup) {
        const key = 'setting:automatic-subscriptions';
        const status = ConfigRenderer.getAppSeting(key) ? 'enable' : 'disable';
        const tasks = SubscriptionsController.buildSubscriptions(
          account,
          status
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

          SubscriptionsController.updateTaskState(task);
        }
        // Subscribe to tasks if app setting enabled.
        if (!fromBackup && account.queryMulti !== null) {
          await TaskOrchestrator.subscribeTasks(tasks, account.queryMulti);
        }
        // Update React subscriptions state.
        SubscriptionsController.syncAccountSubscriptionsState();
      }

      // Show notification.
      if (!fromBackup) {
        await importAddress(alias, fromBackup);
      }

      // Send message back to import window to reset account's processing flag.
      ConfigRenderer.portToImport?.postMessage({
        task: 'import:account:processing',
        data: {
          serEncodedAccount,
          serGenericAccount,
          status: false,
          success: true,
        },
      });

      window.myAPI.relaySharedState('account:importing', false);
      window.myAPI.umamiEvent('account-import', { source, chainId });
    } catch (err) {
      const { serEncodedAccount, serGenericAccount } = ev.data.data;

      ConfigRenderer.portToImport?.postMessage({
        task: 'import:account:processing',
        data: {
          serEncodedAccount,
          serGenericAccount,
          status: false,
          success: false,
        },
      });

      window.myAPI.relaySharedState('account:importing', false);
      console.error(err);
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
      const account = AccountsController.get(chainId, address);
      if (!account) {
        console.log('Account could not be fetched, probably not imported yet');
        return;
      }

      // Unsubscribe from tasks and remove account from controller.
      await AccountsController.removeAllSubscriptions(account);
      AccountsController.remove(chainId, address);

      // Remove all account-scoped chain event subscriptions.
      Core.ChainEventsService.removeAllForAccount(account.flatten());
      removeAllForAccount(account.flatten());

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
    const {
      address,
      chainId,
      newName,
    }: { address: string; chainId: ChainID; newName: string } = ev.data.data;

    const account = AccountsController.get(chainId, address);

    if (account) {
      // Set new account name and persist new account data to storage.
      account.name = newName;
      await AccountsController.set(account);

      // Update cached account name in subscription tasks.
      const flattened = account.flatten();
      flattened.name = newName;
      account.queryMulti?.updateEntryAccountData(chainId, flattened);

      // Update account react state.
      AccountsController.syncState();

      // Update subscription task react state.
      updateAccountNameInTasks(`${chainId}:${address}`, newName);
    }

    // The updated events will be sent back to the renderer for updating React state.
    const serialized = (await window.myAPI.sendEventTaskAsync({
      action: 'events:update:accountName',
      data: { address, chainId, newName },
    })) as string;

    // Update events state.
    const updated: EventCallback[] = JSON.parse(serialized);
    updated.length > 0 && updateEventsOnAccountRename(updated, chainId);

    // Update account name in extrinsics window.
    ConfigRenderer.portToAction?.postMessage({
      task: 'action:account:rename',
      data: { address, chainId, newName },
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
    const result = await ExtrinsicsController.build(info);
    if (result) {
      const { accountNonce, genesisHash, txId, txPayload } = result;
      ConfigRenderer.portToAction?.postMessage({
        task: 'action:tx:report:data',
        data: { accountNonce, genesisHash, txId, txPayload },
      });
    }
  };

  /**
   * @name handleTxVaultSubmit
   * @summary Set signature and submit transaction.
   */
  const handleTxVaultSubmit = (ev: MessageEvent) => {
    const { info: serialized } = ev.data.data;
    const info: ExtrinsicInfo = JSON.parse(serialized);
    const silence =
      cacheGet('setting:silence-os-notifications') ||
      cacheGet('setting:silence-extrinsic-notifications');
    ExtrinsicsController.submit(info, silence);
  };

  /**
   * @name handleTxMockSubmit
   * @summary Mock an extrinsic submission for UI testing.
   */
  const handleTxMockSubmit = (ev: MessageEvent) => {
    const { info: serialized } = ev.data.data;
    const info: ExtrinsicInfo = JSON.parse(serialized);
    const silence =
      cacheGet('setting:silence-os-notifications') ||
      cacheGet('setting:silence-extrinsic-notifications');
    ExtrinsicsController.mockSubmit(info, silence);
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
      if (!api) {
        throw Error('api is null');
      }
      type T = [number, PalletReferendaTrackDetails][];
      const tracks = api.consts.referenda.tracks;
      const serialized = Core.getSerializedTracks(tracks as T);

      ConfigRenderer.portToOpenGov?.postMessage({
        task: 'openGov:tracks:receive',
        data: { serialized, chainId },
      });
    } catch (e) {
      console.error(e);
      ConfigRenderer.portToOpenGov?.postMessage({
        task: 'openGov:tracks:receive',
        data: { serialized: null, chainId },
      });
    }
  };

  /**
   * @name handleGetReferenda
   * @summary Cast an API to get a network's OpenGov referenda.
   */
  const handleGetReferenda = async (ev: MessageEvent) => {
    try {
      // Make API call to fetch referenda entries.
      const { chainId }: { chainId: ChainID } = ev.data.data;
      const client = await APIsController.getConnectedApiOrThrow(chainId);

      if (!client.api) {
        return;
      }
      let referenda: OG.ReferendaInfo[] = [];
      switch (chainId) {
        case 'Polkadot Asset Hub': {
          const api = client.api as DedotClient<ClientTypes['statemint']>;
          referenda = await Core.fetchProcessReferenda(api);
          break;
        }
        case 'Kusama Asset Hub': {
          const api = client.api as DedotClient<ClientTypes['statemine']>;
          referenda = await Core.fetchProcessReferenda(api);
          break;
        }
      }
      ConfigRenderer.portToOpenGov?.postMessage({
        task: 'openGov:referenda:receive',
        data: { json: JSON.stringify(referenda) },
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
   * @name addReferendumSubscriptions
   * @summary Add referendum-scoped chain event and interval subscriptions.
   */
  const addReferendumSubscriptions = async (ev: MessageEvent) => {
    const { refId, tasks } = ev.data.data;
    const parsed: IntervalSubscription[] = JSON.parse(tasks);
    if (!parsed.length) {
      return;
    }
    // Add ref-scoped chain event subscriptions.
    const chainId = parsed[0].chainId;
    addSubsForRef(chainId, refId);

    // Update React state.
    parsed.forEach((task) => addIntervalSubscription(task));

    // Update controller and store.
    IntervalsController.insertSubscriptions(parsed, getOnlineMode());
    for (const task of parsed) {
      await window.myAPI.sendIntervalTask({
        action: 'interval:task:add',
        data: { serialized: JSON.stringify(task) },
      });
    }
  };

  /**
   * @name removeReferendumSubscriptions
   * @summary Remove referendum-scoped chain event and interval subscriptions.
   */
  const removeReferendumSubscriptions = async (ev: MessageEvent) => {
    const { refId, tasks } = ev.data.data;
    const parsed: IntervalSubscription[] = JSON.parse(tasks);
    if (!parsed.length) {
      return;
    }
    // Remove ref-scoped chain event subscriptions.
    const chainId = parsed[0].chainId;
    removeSubsForRef(chainId, refId);

    // Update React state.
    removeIntervalSubscriptions(chainId, refId);

    // Update controller and store.
    IntervalsController.removeSubscriptions(parsed, getOnlineMode());
    await window.myAPI.sendIntervalTask({
      action: 'interval:tasks:remove',
      data: { chainId, refId },
    });
  };

  /**
   * @name handleDebuggingSubscriptions
   * @summary Handle debugging subcscriptions when setting is toggled.
   */
  const handleDebuggingSubscriptions = async () => {
    const key = 'setting:show-debugging-subscriptions';
    toggleSetting(key);

    // Return if setting has been turned on.
    if (ConfigRenderer.getAppSeting(key)) {
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
      for (const task of active) {
        await window.myAPI.sendSubscriptionTask({
          action: 'subscriptions:chain:update',
          data: { serTask: JSON.stringify(task) },
        });

        SubscriptionsController.updateTaskState(task);
      }

      // Unsubscribe from active debugging tasks.
      await SubscriptionsController.subscribeChainTasks(active);
    }
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
            case 'renderer:ledger:sign': {
              const { info: serialized } = ev.data.data;
              const info: ExtrinsicInfo = JSON.parse(serialized);
              await ledgerSignSubmit(info);
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
              const { chainId, target }: { chainId: ChainID; target: string } =
                ev.data.data;

              setSigningChain(chainId);
              await tryCacheSession('extrinsics');
              const result = await verifySigningAccount(target, chainId);
              postApprovedResult(result);
              break;
            }
            case 'renderer:wc:clear:signing-network': {
              setSigningChain(null);
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
            case 'setting:execute': {
              const { setting }: { setting: SettingItem } = ev.data.data;

              // Handle data import.
              if (setting.key === 'setting:import-data') {
                await importDataFromBackup(
                  handleImportAddress,
                  handleRemoveAddress
                );
                return;
              }
              // Handle data export.
              if (setting.key === 'setting:export-data') {
                await exportDataToBackup();
                return;
              }
              // Handle debugging subscriptions state.
              if (setting.key === 'setting:show-debugging-subscriptions') {
                await handleDebuggingSubscriptions();
                return;
              }

              toggleSetting(setting.key);
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
            case 'openGov:subscriptions:add': {
              await addReferendumSubscriptions(ev);
              break;
            }
            case 'openGov:subscriptions:remove': {
              await removeReferendumSubscriptions(ev);
              break;
            }
            default: {
              throw new Error(`Port task not recognized (${ev.data.task})`);
            }
          }
        };

        ConfigRenderer.portToOpenGov.start();
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
