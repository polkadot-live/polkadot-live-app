// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/// Dependencies.
import * as Core from '@polkadot-live/core';
import { WC_EVENT_ORIGIN } from '@polkadot-live/consts/walletConnect';
import { chainUnits } from '@polkadot-live/consts/chains';
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
import BigNumber from 'bignumber.js';
import { planckToUnit } from '@w3ux/utils';
import { concatU8a, encodeAddress, hexToU8a, stringToU8a } from 'dedot/utils';
import { useEffect } from 'react';

/// Main window contexts.
import { useConnections } from '@ren/contexts/common';
import {
  useAddresses,
  useAppSettings,
  useBootstrapping,
  useDataBackup,
  useEvents,
  useIntervalSubscriptions,
  useLedgerSigner,
  useManage,
  useSubscriptions,
  useWalletConnect,
} from '@ren/contexts/main';

/// Types.
import type * as OG from '@polkadot-live/types/openGov';
import type { EventCallback } from '@polkadot-live/types/reporter';
import type { ExtrinsicInfo } from '@polkadot-live/types/tx';
import type {
  IntervalSubscription,
  SubscriptionTask,
} from '@polkadot-live/types/subscriptions';
import type {
  EncodedAccount,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';
import type { DedotClient } from 'dedot';
import type { PalletReferendaTrackDetails } from '@dedot/chaintypes/substrate';
import type { SettingItem } from '@polkadot-live/types/settings';
import type { WcSelectNetwork } from '@polkadot-live/types/walletConnect';
import type {
  ClientTypes,
  DedotOpenGovClient,
} from '@polkadot-live/types/apis';

export const useMainMessagePorts = () => {
  /// Main renderer contexts.
  const { importAddress, removeAddress } = useAddresses();
  const { updateEventsOnAccountRename } = useEvents();
  const { syncOpenGovWindow } = useBootstrapping();
  const { exportDataToBackup, importDataFromBackup } = useDataBackup();

  const { cacheGet } = useConnections();
  const { ledgerSignSubmit } = useLedgerSigner();

  const {
    connectWc,
    disconnectWcSession,
    fetchAddressesFromExistingSession,
    setSigningChain,
    tryCacheSession,
    wcEstablishSessionForExtrinsic,
    wcSignExtrinsic,
    updateWcTxSignMap,
    verifySigningAccount,
  } = useWalletConnect();

  const {
    setRenderedSubscriptions,
    tryAddIntervalSubscription,
    tryRemoveIntervalSubscription,
  } = useManage();

  const { toggleSetting } = useAppSettings();
  const { updateAccountNameInTasks } = useSubscriptions();
  const { addIntervalSubscription, removeIntervalSubscription } =
    useIntervalSubscriptions();

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
          const allTasks =
            SubscriptionsController.getAllSubscriptionsForAccount(
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
      if (cacheGet('mode:connected')) {
        const res = await APIsController.getConnectedApiOrThrow(chainId);
        const api = res.getApi();
        await AccountsController.syncAccount(account, api);
      }

      // Subscribe new account to all possible subscriptions if setting enabled.
      if (account.queryMulti !== null && !fromBackup) {
        const key = 'setting:automatic-subscriptions';
        const status = ConfigRenderer.getAppSeting(key) ? 'enable' : 'disable';
        const tasks = SubscriptionsController.getAllSubscriptionsForAccount(
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

      // Add account to address context state.
      if (!fromBackup) {
        await importAddress(chainId, source, address, alias, fromBackup);
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
   * @name fetchProcessReferenda
   * @summary Use API to fetch and parse a network's OpenGov referenda.
   */
  const fetchProcessReferenda = async (api: DedotOpenGovClient) => {
    // Populate referenda map.
    const results = await api.query.referenda.referendumInfoFor.entries();
    const allReferenda: OG.ReferendaInfo[] = [];

    for (const [refId, storage] of results) {
      if (storage !== undefined) {
        if (storage.type === 'Approved') {
          const info: OG.RefApproved = {
            block: storage.value[0].toString(),
            who: storage.value[1] ? String(storage.value[1].who.raw) : null,
            amount: storage.value[1]
              ? storage.value[1].amount.toString()
              : null,
          };

          allReferenda.push({ refId, refStatus: 'Approved', info });
        } else if (storage.type === 'Cancelled') {
          const info: OG.RefCancelled = {
            block: storage.value[0].toString(),
            who: storage.value[1] ? String(storage.value[1].who.raw) : null,
            amount: storage.value[1]
              ? storage.value[1].amount.toString()
              : null,
          };

          allReferenda.push({ refId, refStatus: 'Cancelled', info });
        } else if (storage.type === 'Rejected') {
          const info: OG.RefRejected = {
            block: storage.value[0].toString(),
            who: storage.value[1] ? String(storage.value[1].who.raw) : null,
            amount: storage.value[1]
              ? storage.value[1].amount.toString()
              : null,
          };

          allReferenda.push({ refId, refStatus: 'Rejected', info });
        } else if (storage.type === 'TimedOut') {
          const info: OG.RefTimedOut = {
            block: storage.value[0].toString(),
            who: storage.value[1] ? String(storage.value[1].who.raw) : null,
            amount: storage.value[1]
              ? storage.value[1].amount.toString()
              : null,
          };

          allReferenda.push({ refId, refStatus: 'TimedOut', info });
        } else if (storage.type === 'Ongoing') {
          const serRef = Core.serializeReferendumInfo(storage.value);

          // In Queue
          if (serRef.inQueue) {
            const info = serRef as OG.RefOngoing;
            allReferenda.push({ refId, refStatus: 'Queueing', info });
          }
          // Preparing
          else if (serRef.deciding === null) {
            const info = serRef as OG.RefPreparing;
            allReferenda.push({ refId, refStatus: 'Preparing', info });
          }
          // Deciding
          else if (serRef.deciding.confirming === null) {
            const info = serRef as OG.RefDeciding;
            allReferenda.push({ refId, refStatus: 'Deciding', info });
          }
          // Confirming
          else if (serRef.deciding.confirming !== null) {
            const info = serRef as OG.RefConfirming;
            allReferenda.push({ refId, refStatus: 'Confirming', info });
          }
        } else if (storage.type === 'Killed') {
          const info: OG.RefKilled = { block: storage.value.toString() };
          allReferenda.push({ refId, refStatus: 'Killed', info });
        }
      }
    }

    // Serialize data before sending to open gov window.
    ConfigRenderer.portToOpenGov?.postMessage({
      task: 'openGov:referenda:receive',
      data: { json: JSON.stringify(allReferenda) },
    });
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

      switch (chainId) {
        case 'Polkadot Relay': {
          const api = client.api as DedotClient<ClientTypes['polkadot']>;
          await fetchProcessReferenda(api);
          break;
        }
        case 'Kusama Relay': {
          const api = client.api as DedotClient<ClientTypes['kusama']>;
          await fetchProcessReferenda(api);
          break;
        }
      }
    } catch (e) {
      console.error(e);
      ConfigRenderer.portToOpenGov?.postMessage({
        task: 'openGov:referenda:receive',
        data: { json: null },
      });
    }
  };

  /**
   * @name processInitTreasury
   * @summary Use API to get treasury data for OpenGov window.
   */
  const processInitTreasury = async (
    api: DedotOpenGovClient,
    chainId: ChainID
  ) => {
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
  };

  /**
   * @name handleInitTreasury
   * @summary Cast API to get treasury data for OpenGov window.
   */
  const handleInitTreasury = async (ev: MessageEvent) => {
    try {
      const { chainId }: { chainId: ChainID } = ev.data.data;
      const api = (
        await APIsController.getConnectedApiOrThrow(chainId)
      ).getApi();

      switch (chainId) {
        case 'Polkadot Relay': {
          await processInitTreasury(
            api as DedotClient<ClientTypes['polkadot']>,
            chainId
          );
          break;
        }
        case 'Kusama Relay': {
          await processInitTreasury(
            api as DedotClient<ClientTypes['kusama']>,
            chainId
          );
          break;
        }
      }
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
              await tryCacheSession();
              await verifySigningAccount(target, chainId);
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
