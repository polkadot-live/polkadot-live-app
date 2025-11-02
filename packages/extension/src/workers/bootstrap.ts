// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { version } from '../../package.json';
import { DbController, LedgerController } from '../controllers';
import {
  deleteAccount,
  getAllAccounts,
  handleGetSpendableBalance,
  persistAccount,
  updateAccount,
} from './accounts';
import { handleImportData } from './backup';
import {
  getAllEvents,
  persistEvent,
  removeEvent,
  updateEventWhoInfo,
} from './events';
import {
  handlePersistExtrinsic,
  removeExtrinsic,
  updateExtrinsic,
} from './extrinsics';
import {
  handleAddIntervalSubscription,
  handleAddIntervalSubscriptions,
  handleGetAllIntervalTasks,
  handleRemoveIntervalSubscription,
  handleRemoveIntervalSubscriptions,
  handleUpdateIntervalSubscription,
} from './intervals';
import { dispatchNotification } from './notifications';
import { eventBus } from './eventBus';
import { sendChromeMessage } from './utils';
import {
  APIsController,
  AccountsController,
  BusDispatcher,
  disconnectAPIs,
  SubscriptionsController,
  TaskOrchestrator,
  tryApiDisconnect,
  executeOneShot,
  pushUniqueEvent,
  doRemoveOutdatedEvents,
  ExtrinsicsController,
  LedgerTxError,
  handleLedgerTaskError,
  IntervalsController,
  fetchCoreTreasuryInfo,
  fetchStatemineTreasuryInfo,
  fetchStatemintTreasuryInfo,
  getSerializedTracks,
  fetchProcessReferenda,
  executeIntervaledOneShot,
} from '@polkadot-live/core';
import { getSupportedChains } from '@polkadot-live/consts/chains';
import { initSharedState } from '@polkadot-live/consts/sharedState';
import { decodeAddress, hexToU8a, u8aToHex } from 'dedot/utils';
import type { Account } from '@polkadot-live/core';
import type {
  AccountSource,
  EncodedAccount,
  FlattenedAccountData,
  ImportedGenericAccount,
  StoredAccount,
} from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  EventCallback,
  NotificationData,
} from '@polkadot-live/types/reporter';
import type {
  ActionMeta,
  ExtrinsicInfo,
  TxStatus,
} from '@polkadot-live/types/tx';
import type {
  ClientTypes,
  FlattenedAPIData,
  NodeEndpoint,
} from '@polkadot-live/types/apis';
import type { DedotClient } from 'dedot';
import type { HexString } from 'dedot/utils';
import type { LedgerTaskResponse } from '@polkadot-live/types/ledger';
import type { SettingItem, SettingKey } from '@polkadot-live/types/settings';
import type {
  IntervalSubscription,
  SubscriptionTask,
} from '@polkadot-live/types/subscriptions';
import type { Stores } from '../controllers';
import type { SyncID, TabData } from '@polkadot-live/types/communication';
import type { SerIpcTreasuryInfo } from '@polkadot-live/types/treasury';
import type { PalletReferendaTrackDetails } from '@dedot/chaintypes/substrate';
import type { ReferendaInfo } from '@polkadot-live/types/openGov';

/** Shared state */
const SHARED_STATE: Map<SyncID, boolean> = initSharedState();

/** Tab loading */
const BACKEND = 'browser';
let ACTIVE_TABS: TabData[] = [];
let PENDING_TAB_DATA: TabData | null = null;
let BROWSER_TAB_ID: number | null = null;

/** Flag set once systems have been initialized once */
let SYSTEMS_INITIALIZED = false;

/** Pending tx metadata to process in extrinsics view */
let PENDING_ACTION_METADATA: ActionMeta | null = null;

/**
 * Bootstrapping
 */

const bootstrap = async () => {
  BusDispatcher.init(eventBus);
  await DbController.initialize();
};

const initOnlineMode = async () => {
  const value = navigator.onLine;
  SHARED_STATE.set('mode:connected', value);
  SHARED_STATE.set('mode:online', value);

  await sendChromeMessage('sharedState', 'set', {
    key: 'mode:connected' as SyncID,
    value,
  });
  await sendChromeMessage('sharedState', 'set', {
    key: 'mode:online' as SyncID,
    value,
  });
};

const initTheme = async () => {
  const key = 'mode:dark';
  const stored = await DbController.get('settings', 'setting:dark-mode');
  const value = Boolean(stored);
  SHARED_STATE.set(key, value);
  sendChromeMessage('sharedState', 'set', { key, value });
};

const initManagedAccounts = async () => {
  if (SYSTEMS_INITIALIZED) {
    return;
  }
  type T = Map<ChainID, StoredAccount[]>;
  const fetched = (await DbController.getAllObjects('managedAccounts')) as T;
  await AccountsController.initialize(BACKEND, fetched);
};

const initAPIs = async () => {
  if (SYSTEMS_INITIALIZED) {
    return;
  }
  await APIsController.initialize(BACKEND);
  const map = new Map<ChainID, FlattenedAPIData>();
  APIsController.clients.map((c) => map.set(c.chainId, c.flatten()));
  sendChromeMessage('api', 'state:chains', {
    ser: JSON.stringify(Array.from(map.entries())),
  });
};

const initAccountSubscriptions = async () => {
  if (SYSTEMS_INITIALIZED) {
    return;
  }
  type T = Map<string, SubscriptionTask[]>;
  const store = 'accountSubscriptions';
  const active = (await DbController.getAllObjects(store)) as T;

  ExtrinsicsController.backend = BACKEND;
  SubscriptionsController.backend = BACKEND;
  await AccountsController.initAccountSubscriptions('browser', active);
};

const initChainSubscriptions = async () => {
  if (SYSTEMS_INITIALIZED) {
    return;
  }
  const store: Stores = 'chainSubscriptions';
  const fetched = (await DbController.getAllObjects(store)) as Map<
    string,
    SubscriptionTask
  >;
  const tasks = Array.from(fetched.values()).map((t) => t);
  const queryMulti = SubscriptionsController.chainSubscriptions;
  await TaskOrchestrator.buildTasks(tasks, queryMulti);
};

const initIntervalSubscriptions = async () => {
  const tasks = await handleGetAllIntervalTasks();
  const isOnline = navigator.onLine;
  IntervalsController.insertSubscriptions(tasks, isOnline);
};

const initSystems = async () => {
  await initOnlineMode();
  await Promise.all([initTheme(), initManagedAccounts(), initAPIs()]);
  await connectApis();
  await initAccountSubscriptions();
  await initChainSubscriptions();
  initIntervalSubscriptions();
  eventBus.dispatchEvent(new CustomEvent('initSystems:complete'));
  SYSTEMS_INITIALIZED = true;
};

// Get a full map of chain subscription tasks.
const getAllChainSubscriptions = async (): Promise<
  Map<ChainID, SubscriptionTask[]>
> => {
  const store: Stores = 'chainSubscriptions';
  const map = new Map<ChainID, SubscriptionTask[]>();
  const fetched = (await DbController.getAllObjects(store)) as Map<
    ChainID,
    SubscriptionTask
  >;
  for (const chainId of [
    'Polkadot Relay',
    'Kusama Relay',
    'Paseo Relay',
  ] as ChainID[]) {
    map.set(chainId, []);
  }
  for (const task of fetched.values()) {
    const { chainId } = task;
    map.set(chainId, [...map.get(chainId)!, task]);
  }
  for (const [key, value] of map.entries()) {
    map.set(key, SubscriptionsController.mergeActiveChainTasks(value, key));
  }
  return map;
};

// Get active account subscriptions from database and merge with inactive.
const getAllAccountSubscriptions = async () => {
  const store = 'accountSubscriptions';
  const active = (await DbController.getAllObjects(store)) as Map<
    string,
    SubscriptionTask[]
  >;
  const result: typeof active = new Map();
  for (const [key, tasks] of active.entries()) {
    const [chainId, address] = key.split(':');
    const account = AccountsController.get(chainId as ChainID, address);
    if (account) {
      result.set(key, SubscriptionsController.mergeActive(account, tasks));
    }
  }
  return result;
};

/**
 * Event bus.
 */
eventBus.addEventListener('showNotification', (e) => {
  const { title, body }: { title: string; body: string } = (e as CustomEvent)
    .detail;
  dispatchNotification(Date.now().toString(), title, body);
});

eventBus.addEventListener('handleTxStatus', async (e) => {
  interface I {
    info: ExtrinsicInfo;
    status: TxStatus;
    isMock: boolean;
  }
  const { info, status, isMock }: I = (e as CustomEvent).detail;
  const { txId, txHash, actionMeta } = info;
  const { eventUid, chainId } = actionMeta;

  sendChromeMessage(
    'extrinsics',
    'reportTxStatus',
    txHash ? { status, txId, txHash } : { status, txId }
  );

  if (eventUid && status === 'finalized' && !isMock) {
    const event = (await DbController.get('events', eventUid)) as
      | EventCallback
      | undefined;

    if (event) {
      event.stale = true;
      await DbController.set('events', eventUid, event);
      sendChromeMessage('events', 'staleEvent', { uid: event.uid, chainId });
    }
  }
});

// Set react state after bootstrapping is complete.
eventBus.addEventListener('initSystems:complete', async () => {
  // Set subscriptions state.
  const map = await getAllAccountSubscriptions();
  const active = await getActiveChains(map);

  sendChromeMessage('subscriptions', 'setAccountSubscriptions', {
    subscriptions: JSON.stringify(Array.from(map.entries())),
    activeChains: JSON.stringify(Array.from(active.entries())),
  });
  // Set managed accounts state.
  sendChromeMessage('managedAccounts', 'setAccountsState', {
    ser: JSON.stringify(
      Array.from(AccountsController.getAllFlattenedAccountData().entries())
    ),
  });
  // Set events state.
  sendChromeMessage('events', 'setEventsState', {
    result: await getAllEvents(),
  });
});

eventBus.addEventListener('processEvent', async (e) => {
  const generateUID = (): string => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0].toString(36);
  };
  interface I {
    event: EventCallback;
    notification: NotificationData;
    showNotification: {
      isOneShot: boolean;
      isEnabled: boolean;
    };
  }
  const { event, notification, showNotification }: I = (e as CustomEvent)
    .detail;

  // Assign UID to event.
  const uid = generateUID();
  event.uid = uid;
  event.txActions = event.txActions.map((obj) => {
    obj.txMeta.eventUid = uid;
    return obj;
  });

  // Handle outdated events.
  const keepOutdated = (await DbController.get(
    'settings',
    'setting:keep-outdated-events'
  )) as boolean;

  if (!keepOutdated) {
    const all = await getAllEvents();
    const { updated, events } = doRemoveOutdatedEvents(event, all);
    if (updated) {
      const remove = all.filter((a) => !events.find((b) => b.uid === a.uid));
      for (const { uid: key } of remove) {
        await DbController.delete('events', key);
      }
    }
  }

  // Persist event if it's unique.
  const events = await getAllEvents();
  const { updated } = pushUniqueEvent(event, events);
  if (updated) {
    await persistEvent(event);
  }

  // Show native notification.
  const { isOneShot, isEnabled } = showNotification;
  const silenced = (await DbController.get(
    'settings',
    'setting:silence-os-notifications'
  )) as boolean;
  const notify = isOneShot ? true : silenced ? false : isEnabled;
  if (isOneShot || (updated && notify)) {
    const { body, title, subtitle } = notification;
    await dispatchNotification(event.uid, title, body, subtitle);
  }

  // Set events state.
  sendChromeMessage('events', 'setEventsState', {
    result: await getAllEvents(),
  });
});

eventBus.addEventListener('setManagedAccountsState', async () => {
  sendChromeMessage('managedAccounts', 'setAccountsState', {
    ser: JSON.stringify(
      Array.from(AccountsController.getAllFlattenedAccountData().entries())
    ),
  });
});

/**
 * APIs.
 */
const connectApis = async () => {
  if (SYSTEMS_INITIALIZED) {
    return;
  }
  if (!navigator.onLine) {
    return false;
  }
  const chainIds = Array.from(AccountsController.accounts.keys());
  await Promise.all(chainIds.map((c) => startApi(c)));
  return true;
};

const closeApis = async () => {
  await APIsController.closeAll();
};

const closeApi = async (chainId: ChainID) => {
  await APIsController.close(chainId);
};

const startApi = async (chainId: ChainID) => {
  const { ack } = await APIsController.connectApi(chainId);
  if (ack === 'success') {
    await onApiRecover(chainId);
  }
};

const onApiRecover = async (chainId: ChainID) => {
  try {
    if (APIsController.failedCache.has(chainId)) {
      APIsController.failedCache.delete(chainId);
      APIsController.syncFailedConnections();
    }

    // Resync accounts and start subscriptions.
    const res = await APIsController.getConnectedApiOrThrow(chainId);
    const api = res.getApi();

    await AccountsController.syncAllAccounts(api, chainId);
    await Promise.all([
      AccountsController.subscribeAccountsForChain(chainId),
      SubscriptionsController.resubscribeChain(chainId),
    ]);
  } catch (error) {
    console.error(error);
  }
};

const onEndpointChange = async (chainId: ChainID, endpoint: NodeEndpoint) => {
  await APIsController.setEndpoint(chainId, endpoint);
  await startApi(chainId);
  SubscriptionsController.syncState();
};

/**
 * Managed accounts.
 */
const persistManagedAccount = async (account: Account) => {
  const store = 'managedAccounts';
  const json: StoredAccount = account.toJSON();
  const { _address, _chain } = json;

  const stored = ((await DbController.get(store, _chain)) ||
    []) as StoredAccount[];
  const updated = [...stored.filter((a) => a._address !== _address), json];
  await DbController.set(store, _chain, updated);
};

const removeManagedAccount = async (account: Account) => {
  const store = 'managedAccounts';
  const json: StoredAccount = account.toJSON();
  const { _address, _chain: key } = json;
  const stored = ((await DbController.get(store, key)) ||
    []) as StoredAccount[];
  const updated = stored.filter((a) => a._address !== _address);
  await DbController.set(store, key, updated);
};

const handleImportAddress = async (
  generic: ImportedGenericAccount,
  encoded: EncodedAccount,
  onlineMode: boolean,
  fromBackup: boolean
) => {
  const relayFlag = (key: string, value: boolean) =>
    sendChromeMessage('sharedState', 'relay', { key, value });

  try {
    relayFlag('account:importing', true);
    const { address, alias, chainId } = encoded;
    const { source } = generic;
    let account = AccountsController.add(encoded, source) || undefined;
    account && (await persistManagedAccount(account));

    // Unsubscribe all tasks if the account exists and is being re-imported.
    if (fromBackup && !account) {
      account = AccountsController.get(chainId, address);
      if (account) {
        // Update account name with one in backup file.
        if (alias !== account.name) {
          account.name = alias;
          await AccountsController.set(account);
        }
        // Remove subscriptions then update database and state.
        const fn = SubscriptionsController.buildSubscriptions;
        await updateAccountSubscriptions(fn(account, 'disable'));
        await setAccountSubscriptionsState();
      }
    }

    // Return if account already exists and isn't being re-imported.
    if (!account) {
      relayFlag('account:importing', false);
      return;
    }

    // Sync managed account data if online.
    if (onlineMode) {
      const res = await APIsController.getConnectedApiOrThrow(chainId);
      const api = res.getApi();
      await AccountsController.syncAccount(account, api);
    }

    // Subscribe new account to all possible subscriptions if setting enabled.
    if (account.queryMulti && !fromBackup) {
      const key = 'setting:automatic-subscriptions';
      const auto = (await DbController.get('settings', key)) as boolean;
      const status = auto ? 'enable' : 'disable';
      const tasks = SubscriptionsController.buildSubscriptions(account, status);
      await updateAccountSubscriptions(tasks);
      await setAccountSubscriptionsState();
    }

    // Update addresses state and show notification.
    if (!fromBackup) {
      eventBus.dispatchEvent(new CustomEvent('setManagedAccountsState'));
      const id = `import:${address}`;
      dispatchNotification(id, 'Account Imported', account.name);
    }

    // Send message back to import window to reset account's processing flag.
    relayFlag('account:importing', false);
    const payload = { encoded, generic, status: false, success: true };
    sendChromeMessage('rawAccount', 'setProcessing', payload);
  } catch (err) {
    console.error(err);
    relayFlag('account:importing', false);
    const payload = { encoded, generic, status: false, success: false };
    sendChromeMessage('rawAccount', 'setProcessing', payload);
  }
};

const handleRemoveAddress = async (address: string, chainId: ChainID) => {
  try {
    const account = AccountsController.get(chainId, address);
    if (!account) {
      console.log('Account could not be fetched, probably not imported yet');
      return;
    }
    // Unsubscribe from tasks and remove account from controller.
    await AccountsController.removeAllSubscriptions(account);
    AccountsController.remove(chainId, address);
    await removeManagedAccount(account);

    // Sync managed accounts state.
    eventBus.dispatchEvent(new CustomEvent('setManagedAccountsState'));

    const key = `${chainId}:${address}`;
    await DbController.delete('accountSubscriptions', key);
    await setAccountSubscriptionsState();

    // Transition away from rendering toggles.
    sendChromeMessage('subscriptions', 'clearRenderedSubscriptions');

    // Disconnect from any API instances that are not currently needed.
    await disconnectAPIs();
  } catch (err) {
    console.error(err);
  }
};

const handleRenameAccount = async (enAccount: EncodedAccount) => {
  const { address, alias: newName, chainId } = enAccount;
  const account = AccountsController.get(chainId, address);
  if (account) {
    // Set new account name and persist new account data to storage.
    account.name = newName;
    await AccountsController.set(account);
    await persistManagedAccount(account);

    // Update cached account name in subscription tasks.
    const flattened = account.flatten();
    flattened.name = newName;
    account.queryMulti?.updateEntryAccountData(chainId, flattened);

    // Sync managed accounts state.
    eventBus.dispatchEvent(new CustomEvent('setManagedAccountsState'));

    // Update subscription task react state.
    sendChromeMessage('subscriptions', 'updateAccountName', {
      key: `${chainId}:${address}`,
      newName,
    });
  }
  // Update events in database and react state.
  sendChromeMessage('events', 'updateAccountNames', {
    chainId,
    updated: await updateEventWhoInfo(address, chainId, newName),
  });

  // Update account name in extrinsics window.
  const payload = { address, chainId, newName };
  sendChromeMessage('extrinsics', 'updateAccountNames', payload);
};

/**
 * Chain subscriptions.
 */
const updateChainSubscriptions = async (tasks: SubscriptionTask[]) => {
  // Update database.
  for (const task of tasks) {
    await updateChainSubscription(task);
  }
  // Subscribe to tasks.
  await SubscriptionsController.subscribeChainTasks(tasks);
  // Disconnect unused APIs.
  await disconnectAPIs();
};

const updateChainSubscription = async (task: SubscriptionTask) => {
  const { action, chainId, status } = task;
  const key = `${chainId}:${action}`;
  const store = 'chainSubscriptions';

  if (status === 'enable') {
    await DbController.set(store, key, task);
  } else {
    const maybeTask = await DbController.get(store, key);
    if (maybeTask !== undefined) {
      await DbController.delete(store, key);
    }
  }
};

const subscribeChainTask = async (task: SubscriptionTask) => {
  await SubscriptionsController.subscribeChainTasks([task]);
  await tryApiDisconnect(task);
};

const setChainSubscriptionsState = async () => {
  const fetched = await getAllChainSubscriptions();
  sendChromeMessage('subscriptions', 'setChainSubscriptions', {
    ser: JSON.stringify(Array.from(fetched.entries())),
  });
};

const updateAccountSubscriptions = async (tasks: SubscriptionTask[]) => {
  const { chainId, account: flattened } = tasks[0];
  const account = AccountsController.get(chainId, flattened?.address);
  if (!account) {
    return;
  }
  // Update database.
  for (const task of tasks) {
    await updateAccountSubscription(account, task);
  }
  // Subscribe to tasks.
  if (account.queryMulti) {
    await TaskOrchestrator.subscribeTasks(tasks, account.queryMulti);
  }
  // Disconnect unused APIs.
  await disconnectAPIs();
};

const updateAccountSubscription = async (
  account: Account,
  task: SubscriptionTask
) => {
  const { address, chain: chainId } = account;
  const { action, status } = task;
  const key = `${chainId}:${address}`;
  const store = 'accountSubscriptions';

  const fetched = await DbController.get(store, key);
  const tasks = (fetched || []) as SubscriptionTask[];
  const filtered = tasks.filter((t) => t.action !== action);

  status === 'enable'
    ? await DbController.set(store, key, [...filtered, task])
    : await DbController.set(store, key, [...filtered]);
};

const getActiveChains = async (map: Map<string, SubscriptionTask[]>) => {
  const active = new Map<ChainID, number>();
  for (const [key, tasks] of map.entries()) {
    const chainId = key.split(':')[0] as ChainID;
    active.set(
      chainId,
      tasks.reduce((acc, t) => (t.status === 'enable' ? acc + 1 : acc), 0)
    );
  }
  for (const chainId of Object.keys(getSupportedChains()) as ChainID[]) {
    if (!active.has(chainId)) {
      active.set(chainId, 0);
    }
  }
  return active;
};

const setAccountSubscriptionsState = async () => {
  const map = await getAllAccountSubscriptions();
  const active = await getActiveChains(map);
  sendChromeMessage('subscriptions', 'setAccountSubscriptions', {
    subscriptions: JSON.stringify(Array.from(map.entries())),
    activeChains: JSON.stringify(Array.from(active.entries())),
  });
};

const subscribeAccountTask = async (task: SubscriptionTask) => {
  await AccountsController.subscribeTask(task);
  await tryApiDisconnect(task);
};

const onNotificationToggle = async (task: SubscriptionTask) => {
  const { chainId, account: flattened } = task;
  const account = AccountsController.get(chainId, flattened?.address);
  if (!account) {
    return;
  }
  account.queryMulti?.setOsNotificationsFlag(task);
  await updateAccountSubscription(account, task);
  await setAccountSubscriptionsState();
};

/**
 * Extrinsics.
 */
const getAllExtrinsics = async () => {
  const all = (await DbController.getAllObjects('extrinsics')) as Map<
    string,
    ExtrinsicInfo
  >;
  return Array.from(all.values()).map((e) => e);
};

const handleGetEstimatedFee = async (info: ExtrinsicInfo): Promise<string> =>
  (await ExtrinsicsController.getEstimatedFee(info)).toString();

const handleBuildExtrinsic = async (info: ExtrinsicInfo) => {
  const result = await ExtrinsicsController.build(info);
  if (result) {
    const { accountNonce, genesisHash, txPayload } = result;
    return { accountNonce, genesisHash, txPayload };
  } else {
    return null;
  }
};

const handleSubmitExtrinsic = async (info: ExtrinsicInfo) => {
  const results = (await Promise.all([
    DbController.get('settings', 'setting:silence-os-notifications'),
    DbController.get('settings', 'setting:silence-extrinsic-notifications'),
  ])) as boolean[];
  ExtrinsicsController.submit(info, results.some(Boolean));
};

const handleSubmitMockExtrinsic = async (info: ExtrinsicInfo) => {
  const results = (await Promise.all([
    DbController.get('settings', 'setting:silence-os-notifications'),
    DbController.get('settings', 'setting:silence-extrinsic-notifications'),
  ])) as boolean[];
  ExtrinsicsController.mockSubmit(info, results.some(Boolean));
};

const getAccountLedgerMeta = async (chainId: ChainID, from: string) => {
  const publicKeyHex = u8aToHex(decodeAddress(from));
  const accounts = (await DbController.get(
    'accounts',
    'ledger'
  )) as ImportedGenericAccount[];
  const account = accounts.find((a) => a.publicKeyHex === publicKeyHex);
  const result = account
    ? account.encodedAccounts[chainId].ledgerMeta
    : undefined;
  return result;
};

const handleLedgerSignSubmit = async (
  info: ExtrinsicInfo
): Promise<LedgerTaskResponse> => {
  try {
    const { chainId, from } = info.actionMeta;
    const meta = await getAccountLedgerMeta(chainId, from);
    if (!meta) {
      throw new Error('AccountLedgerMetaNotFound');
    }
    info.actionMeta.ledgerMeta = meta;
    const { txId, dynamicInfo } = info;
    if (!dynamicInfo) {
      throw new LedgerTxError('TxDynamicInfoUndefined');
    }
    const txData = ExtrinsicsController.getTransactionPayload(txId);
    if (!txData) {
      throw new LedgerTxError('TxDataUndefined');
    }
    const { proof, rawPayload } = txData;
    if (!(proof && rawPayload)) {
      throw new LedgerTxError('TxPayloadsUndefined');
    }
    const { app } = await LedgerController.initialize();
    const { accountIndex: index } = meta;
    const txBlob = hexToU8a(rawPayload.data);
    const res = await LedgerController.signPayload(app, index, txBlob, proof);

    if (!res.success) {
      return handleLedgerTaskError(res.error!);
    }
    dynamicInfo.txSignature = res.results! as HexString;

    const settings = (await Promise.all([
      DbController.get('settings', 'setting:silence-os-notifications'),
      DbController.get('settings', 'setting:silence-extrinsic-notifications'),
    ])) as boolean[];
    ExtrinsicsController.submit(info, settings.some(Boolean));

    return { ack: 'success', statusCode: 'LedgerSign' };
  } catch (error) {
    return handleLedgerTaskError(error as Error);
  }
};

bootstrap().then(() => {
  console.log('> Bootstrap complete...');
});

/**
 * Utils
 */
const isMainTabOpen = async (): Promise<chrome.tabs.Tab | undefined> => {
  const url = chrome.runtime.getURL('src/tab/index.html');
  const tabs = await chrome.tabs.query({});
  return tabs.find((tab) => tab.url?.split('#')[0] === url);
};

/**
 * Treasury
 */
export const handleInitTreasury = async (
  chainId: ChainID
): Promise<SerIpcTreasuryInfo | null> => {
  try {
    const api = (await APIsController.getConnectedApiOrThrow(chainId)).getApi();
    switch (chainId) {
      case 'Polkadot Relay': {
        const castApi = api as DedotClient<ClientTypes['polkadot']>;
        const [coreTreasuryInfo, statemintTreasuryInfo] = await Promise.all([
          fetchCoreTreasuryInfo(castApi, chainId),
          fetchStatemintTreasuryInfo(),
        ]);
        // Return serialized.
        const { usdcBalance, usdtBalance, dotBalance } = statemintTreasuryInfo;
        return {
          coreTreasuryInfo,
          serStatemintTreasuryInfo: {
            usdcBalance: usdcBalance.toString(),
            usdtBalance: usdtBalance.toString(),
            dotBalance: dotBalance.toString(),
          },
        };
      }
      case 'Kusama Asset Hub': {
        const castApi = api as DedotClient<ClientTypes['statemine']>;
        const [coreTreasuryInfo, statemineTreasuryInfo] = await Promise.all([
          fetchCoreTreasuryInfo(castApi, chainId),
          fetchStatemineTreasuryInfo(),
        ]);
        // Return serialized.
        const { ksmBalance } = statemineTreasuryInfo;
        return {
          coreTreasuryInfo,
          serStatemineTreasuryInfo: {
            ksmBalance: ksmBalance.toString(),
          },
        };
      }
    }
    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const handleFetchTracks = async (chainId: ChainID) => {
  try {
    const { api } = await APIsController.getConnectedApiOrThrow(chainId);
    if (!api) {
      throw Error('api is null');
    }
    type T = [number, PalletReferendaTrackDetails][];
    const tracks = api.consts.referenda.tracks;
    return getSerializedTracks(tracks as T);
  } catch (e) {
    console.error(e);
    return null;
  }
};

/**
 * Referenda
 */
const handleFetchReferenda = async (
  chainId: ChainID
): Promise<ReferendaInfo[] | null> => {
  try {
    const client = await APIsController.getConnectedApiOrThrow(chainId);
    if (!client.api) {
      return null;
    }
    let referenda: ReferendaInfo[] = [];
    switch (chainId) {
      case 'Polkadot Relay': {
        const api = client.api as DedotClient<ClientTypes['polkadot']>;
        referenda = await fetchProcessReferenda(api);
        break;
      }
      case 'Kusama Asset Hub': {
        const api = client.api as DedotClient<ClientTypes['statemine']>;
        referenda = await fetchProcessReferenda(api);
        break;
      }
    }
    return referenda;
  } catch (e) {
    console.error(e);
    return null;
  }
};

const handleDebuggingSubscriptions = async (setting: SettingItem) => {
  if (setting.enabled) {
    return;
  }
  // Unsubscribe from any active debugging subscriptions.
  for (const tasks of SubscriptionsController.getChainSubscriptions().values()) {
    const active = tasks
      .filter((t) => t.status === 'enable')
      .map((t) => ({ ...t, status: 'disable' }) as SubscriptionTask);
    if (active.length === 0) {
      continue;
    }
    await updateChainSubscriptions(active);
    await setChainSubscriptionsState();
  }
};

/**
 * Data Backup
 */
const getExportData = async (): Promise<string> => {
  const map = new Map<string, string>();

  const getSerEvents = async () => {
    type M = Map<string, EventCallback>;
    const fetched = (await DbController.getAllObjects('events')) as M;
    return JSON.stringify(
      Array.from(fetched.values()).filter((e) => e.category !== 'debugging')
    );
  };
  const getSerExtrinsics = async () => {
    type M = Map<string, ExtrinsicInfo>;
    const fetched = (await DbController.getAllObjects('extrinsics')) as M;
    return JSON.stringify(Array.from(fetched.values()));
  };
  const getSerIntervals = async () => {
    type M = Map<ChainID, IntervalSubscription[]>;
    const store = 'intervalSubscriptions';
    const fetched = (await DbController.getAllObjects(store)) as M;
    return JSON.stringify(Array.from(fetched.values()).flat());
  };

  map.set('version', version);
  map.set('addresses', await DbController.getAll('accounts'));
  map.set('accountTasks', await DbController.getAll('accountSubscriptions'));
  map.set('events', await getSerEvents());
  map.set('extrinsics', await getSerExtrinsics());
  map.set('intervals', await getSerIntervals());

  return JSON.stringify(Array.from(map));
};

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  switch (message.type) {
    /**
     * Handle data backup tasks.
     */
    case 'dataBackup': {
      switch (message.task) {
        case 'exportData': {
          getExportData().then((result) => sendResponse(result));
          return true;
        }
        case 'importData': {
          const {
            contents,
            isOnline,
          }: { contents: string; isOnline: boolean } = message.payload;
          // TMP: Provide function pointers until refactor.
          handleImportData(
            contents,
            isOnline,
            handleImportAddress,
            handleRemoveAddress,
            updateAccountSubscription,
            setAccountSubscriptionsState,
            subscribeAccountTask
          ).then(() => {
            sendResponse(true);
          });
          return true;
        }
      }
      break;
    }
    /**
     * Handle database tasks.
     */
    case 'settings': {
      switch (message.task) {
        case 'handleSetting': {
          const { setting }: { setting: SettingItem } = message.payload;
          if (setting.key === 'setting:show-debugging-subscriptions') {
            handleDebuggingSubscriptions(setting);
            return;
          }
          return false;
        }
      }
      break;
    }
    case 'db': {
      switch (message.task) {
        case 'settings:get': {
          const { store, key }: { store: Stores; key: string } = message;
          DbController.get(store, key).then(sendResponse);
          return true;
        }
        case 'settings:getAll': {
          DbController.getAll('settings').then((result) => {
            sendResponse(result);
          });
          return true;
        }
        case 'settings:set': {
          const { key, value }: { key: SettingKey; value: boolean } = message;
          DbController.set('settings', key, value);
          return false;
        }
      }
      break;
    }
    /**
     * Handle raw account tasks.
     */
    case 'rawAccount': {
      switch (message.task) {
        case 'getAll': {
          getAllAccounts().then((result) => sendResponse(result));
          return true;
        }
        case 'getAllBySource': {
          const { source }: { source: AccountSource } = message.payload;
          DbController.get('accounts', source).then((result) =>
            sendResponse(result)
          );
          return true;
        }
        case 'getSpendableBalance': {
          const { address, chainId }: { address: string; chainId: ChainID } =
            message.payload;
          handleGetSpendableBalance(address, chainId).then((res) =>
            sendResponse(res.toString())
          );
          return true;
        }
        case 'delete': {
          const {
            publicKeyHex,
            source,
          }: { publicKeyHex: string; source: AccountSource } = message.payload;
          deleteAccount(publicKeyHex, source).then((res) => sendResponse(res));
          return true;
        }
        case 'persist': {
          const { account } = message.payload;
          persistAccount(account).then((res) => sendResponse(res));
          return true;
        }
        case 'update': {
          const { account } = message.payload;
          updateAccount(account).then((res) => sendResponse(res));
          return true;
        }
        case 'importAddress': {
          const { encodedAccount, genericAccount } = message.payload;
          const isOnline =
            Boolean(SHARED_STATE.get('mode:connected')) &&
            Boolean(SHARED_STATE.get('mode:online'));
          handleImportAddress(genericAccount, encodedAccount, isOnline, false);
          return false;
        }
        case 'removeAddress': {
          const { address, chainId } = message.payload;
          handleRemoveAddress(address, chainId);
          return false;
        }
        case 'renameAccount': {
          const { account } = message.payload;
          handleRenameAccount(account).then((res) => sendResponse(res));
          return true;
        }
      }
      break;
    }
    /**
     * Handle managed accounts.
     */
    case 'managedAccounts': {
      switch (message.task) {
        case 'getAll': {
          sendResponse(
            JSON.stringify(
              Array.from(
                AccountsController.getAllFlattenedAccountData().entries()
              )
            )
          );
          return true;
        }
        // TODO: Refactor
        case 'subscriptionCount': {
          const { flattened }: { flattened: FlattenedAccountData } = message;
          const { address, chain } = flattened;
          const account = AccountsController.get(chain, address);
          sendResponse(
            account ? account.getSubscriptionTasks()?.length || 0 : 0
          );
          return true;
        }
      }
      break;
    }
    /**
     * Handle shared state tasks.
     */
    case 'sharedState': {
      switch (message.task) {
        case 'get': {
          sendResponse(JSON.stringify(Array.from(SHARED_STATE.entries())));
          return true;
        }
        case 'relay': {
          const { payload } = message;
          sendChromeMessage('sharedState', 'set', payload);
          return false;
        }
      }
      break;
    }
    /**
     * Handle bootstrapping tasks.
     */
    case 'bootstrap': {
      switch (message.task) {
        case 'initSystems': {
          initSystems().then(() => {
            sendResponse(true);
          });
          return true;
        }
        case 'connectApis': {
          connectApis().then((res) => {
            sendResponse(res);
          });
          return true;
        }
        case 'disconnectApis': {
          // Don't disconnect from unused APIs when popup reloaded.
          if (SYSTEMS_INITIALIZED) {
            sendResponse(true);
          } else {
            disconnectAPIs().then(() => sendResponse(true));
          }
          return true;
        }
        case 'closeApis': {
          closeApis().then(() => sendResponse(true));
          return true;
        }
      }
      break;
    }
    /**
     * Handle API tasks.
     */
    case 'api': {
      switch (message.task) {
        case 'startApi': {
          const { chainId }: { chainId: ChainID } = message;
          startApi(chainId).then(() => sendResponse(true));
          return true;
        }
        case 'closeApi': {
          const { chainId }: { chainId: ChainID } = message;
          closeApi(chainId).then(() => sendResponse(true));
          return true;
        }
        case 'endpointChange': {
          const {
            chainId,
            endpoint,
          }: { chainId: ChainID; endpoint: NodeEndpoint } = message.meta;
          onEndpointChange(chainId, endpoint).then(() => sendResponse(true));
          return true;
        }
        case 'syncChainState': {
          APIsController.syncChainConnections();
          return false;
        }
      }
      break;
    }
    /**
     * Handle tab tasks.
     */
    case 'tabs': {
      switch (message.task) {
        case 'isTabOpen': {
          const { tab } = message;
          sendResponse(Boolean(ACTIVE_TABS.find((t) => t.viewId === tab)));
          return true;
        }
        case 'closeTab': {
          const { tab } = message;
          ACTIVE_TABS = ACTIVE_TABS.filter((t) => t.viewId !== tab);
          return false;
        }
        case 'openTabRelay': {
          const { tabData }: { tabData: TabData } = message.payload;
          const { viewId } = tabData;

          isMainTabOpen().then((tab) => {
            const browserTabOpen = Boolean(tab);
            browserTabOpen && (BROWSER_TAB_ID = tab?.id || null);
            const url = chrome.runtime.getURL(`src/tab/index.html#${viewId}`);

            if (browserTabOpen) {
              BROWSER_TAB_ID &&
                chrome.tabs.update(BROWSER_TAB_ID, { active: true });
              sendChromeMessage('tabs', 'openTab', { tabData });
            } else {
              ACTIVE_TABS = [];
              PENDING_TAB_DATA = tabData;
              chrome.tabs.create({ url }).then((newTab) => {
                BROWSER_TAB_ID = newTab.id || null;
              });
            }
          });
          return false;
        }
        case 'syncTabs': {
          const tabData = PENDING_TAB_DATA;
          PENDING_TAB_DATA = null;
          sendResponse(tabData);
          return true;
        }
      }
      break;
    }
    /**
     * Handle event tasks.
     */
    case 'events': {
      switch (message.task) {
        case 'remove': {
          const { event }: { event: EventCallback } = message.payload;
          removeEvent(event).then(() => sendResponse(true));
          return true;
        }
      }
      break;
    }
    /**
     * Handle subscription tasks.
     */
    case 'subscriptions': {
      switch (message.task) {
        case 'chainHasSubscriptions': {
          const { chainId }: { chainId: ChainID } = message.payload;
          const accounts = AccountsController.accounts.get(chainId) || [];

          let result = false;
          for (const account of accounts) {
            const tasks = account.getSubscriptionTasks();
            if (tasks && tasks.length > 0) {
              result = true;
              break;
            }
          }
          sendResponse(result);
        }
      }
      break;
    }
    /**
     * Handle account subscription tasks.
     */
    case 'accountSubscriptions': {
      switch (message.task) {
        case 'update': {
          const { task }: { task: SubscriptionTask } = message.payload;
          const { chainId, account: flattened } = task;
          const account = AccountsController.get(chainId, flattened?.address);
          if (!account) {
            sendResponse(false);
          } else {
            updateAccountSubscription(account, task).then(() =>
              subscribeAccountTask(task).then(() =>
                setAccountSubscriptionsState().then(() => sendResponse(true))
              )
            );
          }
          return true;
        }
        case 'updateMany': {
          const { tasks }: { tasks: SubscriptionTask[] } = message.payload;
          updateAccountSubscriptions(tasks).then(() =>
            setAccountSubscriptionsState().then(() => sendResponse(true))
          );
          return true;
        }
        case 'notificationToggle': {
          const { task }: { task: SubscriptionTask } = message.payload;
          onNotificationToggle(task).then(() => sendResponse(true));
          return true;
        }
      }
      break;
    }
    /**
     * Handle chain (debugging) subscription tasks.
     */
    case 'chainSubscriptions': {
      switch (message.task) {
        case 'getAll': {
          getAllChainSubscriptions().then((result) => {
            sendResponse(JSON.stringify(Array.from(result.entries())));
          });
          return true;
        }
        case 'update': {
          const { task }: { task: SubscriptionTask } = message.payload;
          updateChainSubscription(task).then(() =>
            subscribeChainTask(task).then(() =>
              setChainSubscriptionsState().then(() => sendResponse(true))
            )
          );
          return true;
        }
        case 'updateMany': {
          const { tasks }: { tasks: SubscriptionTask[] } = message.payload;
          updateChainSubscriptions(tasks).then(() =>
            setChainSubscriptionsState().then(() => sendResponse(true))
          );
          return true;
        }
      }
      break;
    }
    /**
     * Handle one-shot tasks.
     */
    case 'oneShot': {
      switch (message.task) {
        case 'execute': {
          const { task }: { task: SubscriptionTask } = message.payload;
          executeOneShot(task).then((success) => sendResponse(success));
          return true;
        }
        case 'executeInterval': {
          const { task }: { task: IntervalSubscription } = message.payload;
          executeIntervaledOneShot(task, 'one-shot').then((result) =>
            sendResponse(result)
          );
          return true;
        }
      }
      break;
    }
    /**
     * Handle WalletConnect tasks.
     */
    case 'walletConnect': {
      switch (message.task) {
        case 'getTxData': {
          const { txId }: { txId: string } = message.payload;
          const result = ExtrinsicsController.getTransactionPayload(txId);
          sendResponse(result?.payload || null);
          return true;
        }
      }
      break;
    }
    case 'walletConnect:relay': {
      switch (message.task) {
        case 'closeModal': {
          sendChromeMessage('walletConnect', 'closeModal');
          return false;
        }
        case 'openModal': {
          sendChromeMessage('walletConnect', 'openModal', message.payload);
          return false;
        }
        case 'setAddresses': {
          sendChromeMessage('walletConnect', 'setAddresses', message.payload);
          return false;
        }
      }
      break;
    }
    /**
     * Handle extrinsics tasks.
     */
    case 'extrinsics': {
      switch (message.task) {
        case 'buildExtrinsic': {
          const { info }: { info: ExtrinsicInfo } = message.payload;
          handleBuildExtrinsic(info).then((res) => sendResponse(res));
          return true;
        }
        case 'dispatchNotification': {
          const { title, body }: { title: string; body: string } =
            message.payload;
          dispatchNotification(Date.now().toString(), title, body);
          return false;
        }
        case 'getAll': {
          getAllExtrinsics().then((res) => sendResponse(res));
          return true;
        }
        case 'getEstimatedFee': {
          const { info }: { info: ExtrinsicInfo } = message.payload;
          handleGetEstimatedFee(info).then((res) => sendResponse(res));
          return true;
        }
        case 'persist': {
          const { info }: { info: ExtrinsicInfo } = message.payload;
          handlePersistExtrinsic(info);
          return false;
        }
        case 'update': {
          const { info }: { info: ExtrinsicInfo } = message.payload;
          updateExtrinsic(info);
          return false;
        }
        case 'remove': {
          const { txId }: { txId: string } = message.payload;
          removeExtrinsic(txId);
          return false;
        }
        case 'initTxRelay': {
          // Cache action meta and fetch from extrinsics window when open.
          const { actionMeta }: { actionMeta: ActionMeta } = message.payload;
          const tabData: TabData = {
            id: -1,
            viewId: 'action',
            label: 'Extrinsics',
          };
          const { viewId } = tabData;

          isMainTabOpen().then((tab) => {
            const browserTabOpen = Boolean(tab);
            browserTabOpen && (BROWSER_TAB_ID = tab?.id || null);
            const url = chrome.runtime.getURL(`src/tab/index.html#${viewId}`);

            if (browserTabOpen) {
              BROWSER_TAB_ID &&
                chrome.tabs.update(BROWSER_TAB_ID, { active: true });
              sendChromeMessage('tabs', 'openTab', { tabData });
              sendChromeMessage('extrinsics', 'tryInitTx', { actionMeta });
            } else {
              ACTIVE_TABS = [];
              PENDING_TAB_DATA = tabData;
              PENDING_ACTION_METADATA = actionMeta;
              chrome.tabs.create({ url }).then((newTab) => {
                BROWSER_TAB_ID = newTab.id || null;
              });
            }
          });
          return false;
        }
        case 'initTx': {
          const actionMeta = PENDING_ACTION_METADATA;
          PENDING_ACTION_METADATA = null;
          sendResponse(actionMeta);
          return true;
        }
        case 'submit': {
          const { info }: { info: ExtrinsicInfo } = message.payload;
          handleSubmitExtrinsic(info);
          return false;
        }
        case 'submitMock': {
          const { info }: { info: ExtrinsicInfo } = message.payload;
          handleSubmitMockExtrinsic(info);
          return false;
        }
        case 'ledgerSignSubmit': {
          const { info }: { info: ExtrinsicInfo } = message.payload;
          handleLedgerSignSubmit(info).then((result: LedgerTaskResponse) =>
            sendResponse(result)
          );
          return true;
        }
      }
      break;
    }
    /**
     * Handle interval subscription tasks.
     */
    case 'intervalSubscriptions': {
      switch (message.task) {
        case 'add': {
          const {
            task,
            onlineMode,
          }: { task: IntervalSubscription; onlineMode: boolean } =
            message.payload;
          handleAddIntervalSubscription(task, onlineMode);
          return false;
        }
        case 'addMulti': {
          const {
            tasks,
            onlineMode,
          }: { tasks: IntervalSubscription[]; onlineMode: boolean } =
            message.payload;
          handleAddIntervalSubscriptions(tasks, onlineMode);
          return false;
        }
        case 'getAll': {
          handleGetAllIntervalTasks().then((result: IntervalSubscription[]) =>
            sendResponse(result)
          );
          return true;
        }
        case 'removeMulti': {
          const {
            tasks,
            onlineMode,
          }: { tasks: IntervalSubscription[]; onlineMode: boolean } =
            message.payload;
          handleRemoveIntervalSubscriptions(tasks, onlineMode);
          return false;
        }
        case 'delete': {
          const {
            task,
            onlineMode,
          }: { task: IntervalSubscription; onlineMode: boolean } =
            message.payload;

          IntervalsController.removeSubscription(task, onlineMode);
          handleRemoveIntervalSubscription(task);
          return false;
        }
        case 'insertSubscription': {
          const {
            task,
            onlineMode,
          }: { task: IntervalSubscription; onlineMode: boolean } =
            message.payload;
          IntervalsController.insertSubscription(task, onlineMode);
          return false;
        }
        case 'insertSubscriptions': {
          const {
            tasks,
            onlineMode,
          }: { tasks: IntervalSubscription[]; onlineMode: boolean } =
            message.payload;
          IntervalsController.insertSubscriptions(tasks, onlineMode);
          return false;
        }
        case 'remove': {
          const {
            task,
            onlineMode,
          }: { task: IntervalSubscription; onlineMode: boolean } =
            message.payload;
          task.status === 'enable' &&
            IntervalsController.removeSubscription(task, onlineMode);
          handleRemoveIntervalSubscription(task);
          return false;
        }
        case 'removeSubscription': {
          const {
            task,
            onlineMode,
          }: { task: IntervalSubscription; onlineMode: boolean } =
            message.payload;
          IntervalsController.removeSubscription(task, onlineMode);
          return false;
        }
        case 'removeSubscriptions': {
          const {
            tasks,
            onlineMode,
          }: { tasks: IntervalSubscription[]; onlineMode: boolean } =
            message.payload;
          IntervalsController.removeSubscriptions(tasks, onlineMode);
          return false;
        }
        case 'update': {
          const { task }: { task: IntervalSubscription } = message.payload;
          handleUpdateIntervalSubscription(task).then(() =>
            IntervalsController.updateSubscription(task)
          );
          return false;
        }
      }
      break;
    }
    /**
     * Handle treasury tasks.
     */
    case 'openGov': {
      switch (message.task) {
        case 'fetchTracks': {
          const { chainId }: { chainId: ChainID } = message.payload;
          handleFetchTracks(chainId).then((result) => sendResponse(result));
          return true;
        }
        case 'fetchReferenda': {
          const { chainId }: { chainId: ChainID } = message.payload;
          handleFetchReferenda(chainId).then((result) => sendResponse(result));
          return true;
        }
        case 'initTreasury': {
          const { chainId }: { chainId: ChainID } = message.payload;
          handleInitTreasury(chainId).then((result) => sendResponse(result));
          return true;
        }
      }
      break;
    }
  }
});
