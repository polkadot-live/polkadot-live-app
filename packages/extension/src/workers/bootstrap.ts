// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../controllers';
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
} from '@polkadot-live/core';
import {
  getSupportedChains,
  getSupportedSources,
} from '@polkadot-live/consts/chains';
import { initSharedState } from '@polkadot-live/consts/sharedState';
import type {
  AccountSource,
  EncodedAccount,
  FlattenedAccountData,
  ImportedGenericAccount,
  StoredAccount,
} from '@polkadot-live/types/accounts';
import type { Account } from '@polkadot-live/core';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  EventAccountData,
  EventCallback,
  NotificationData,
} from '@polkadot-live/types/reporter';
import type { FlattenedAPIData, NodeEndpoint } from '@polkadot-live/types/apis';
import type { SettingKey } from '@polkadot-live/types/settings';
import type { SubscriptionTask } from '@polkadot-live/types/subscriptions';
import type { Stores } from '../controllers';
import type { SyncID, TabData } from '@polkadot-live/types/communication';

/** Shared state */
const SHARED_STATE: Map<SyncID, boolean> = initSharedState();

/** Tab loading */
const BACKEND = 'browser';
let ACTIVE_TABS: TabData[] = [];
let PENDING_TAB_DATA: TabData | null = null;
let TAB_ID: number | null = null;

/** Flag set once systems have been initialized once */
let SYSTEMS_INITIALIZED = false;

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
  if (!SYSTEMS_INITIALIZED) {
    await APIsController.initialize(BACKEND);
  }
  const map = new Map<ChainID, FlattenedAPIData>();
  APIsController.clients.map((c) => map.set(c.chainId, c.flatten()));
  sendChromeMessage('api', 'state:chains', {
    ser: JSON.stringify(Array.from(map.entries())),
  });
};

const initSubscriptions = async () => {
  if (SYSTEMS_INITIALIZED) {
    return;
  }
  type T = Map<string, SubscriptionTask[]>;
  const store = 'accountSubscriptions';
  const active = (await DbController.getAllObjects(store)) as T;

  SubscriptionsController.backend = BACKEND;
  await Promise.all([
    AccountsController.initAccountSubscriptions('browser', active),
    SubscriptionsController.initChainSubscriptions(),
  ]);
};

const initSystems = async () => {
  await initOnlineMode();
  await Promise.all([initTheme(), initManagedAccounts(), initAPIs()]);
  await connectApis();
  await initSubscriptions();
  eventBus.dispatchEvent(new CustomEvent('initSystems:complete'));
  SYSTEMS_INITIALIZED = true;
};

// TODO: getAllChainSubscriptions
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
 * Events
 */

const getAllEvents = async (): Promise<EventCallback[]> => {
  const map = await DbController.getAllObjects('events');
  return Array.from((map as Map<string, EventCallback>).values()).map((e) => e);
};

const persistEvent = async (event: EventCallback) => {
  // TODO: Take into account keep outdated events setting.
  await DbController.set('events', event.uid, event);
};

const removeEvent = async (event: EventCallback) =>
  await DbController.delete('events', event.uid);

const updateEventWhoInfo = async (
  address: string,
  chainId: ChainID,
  newName: string
): Promise<EventCallback[]> => {
  const cmp = (a: EventAccountData) =>
    a.address === address && a.chainId === chainId && a.accountName !== newName;

  const updated: EventCallback[] = [];
  const events = (await DbController.getAllObjects('events')) as Map<
    string,
    EventCallback
  >;
  for (const [uid, e] of events.entries()) {
    if (e.who.origin === 'chain') {
      continue;
    }
    if (cmp(e.who.data as EventAccountData)) {
      (e.who.data as EventAccountData).accountName = newName;
      await DbController.set('events', uid, e);
      updated.push(e);
    }
  }
  return updated;
};

/**
 * Event bus.
 */

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
 * Raw accounts.
 */

const getAllAccounts = async (): Promise<string> => {
  const map = new Map<AccountSource, ImportedGenericAccount[]>();
  for (const source of getSupportedSources()) {
    const result = await DbController.get('accounts', source);
    map.set(source, (result as ImportedGenericAccount[]) || []);
  }
  return JSON.stringify(Array.from(map.entries()));
};

const isAlreadyPersisted = async (publicKeyHex: string): Promise<boolean> => {
  for (const source of [
    'ledger',
    'read-only',
    'vault',
    'wallet-connect',
  ] as AccountSource[]) {
    const stored = (await DbController.get('accounts', source)) as
      | ImportedGenericAccount[]
      | undefined;
    if ((stored || []).find((a) => a.publicKeyHex === publicKeyHex)) {
      return true;
    }
  }
  return false;
};

const persistAccount = async (account: ImportedGenericAccount) => {
  try {
    const { publicKeyHex, source } = account;
    const alreadyExists = await isAlreadyPersisted(publicKeyHex);
    if (!alreadyExists) {
      const all = (await DbController.get('accounts', source)) as
        | ImportedGenericAccount[]
        | undefined;
      await DbController.set('accounts', source, [...(all || []), account]);
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const updateAccount = async (account: ImportedGenericAccount) => {
  try {
    const { publicKeyHex, source } = account;
    const all = (await DbController.get('accounts', source)) as
      | ImportedGenericAccount[]
      | undefined;
    const updated = (all || []).map((a) =>
      a.publicKeyHex === publicKeyHex ? account : a
    );
    await DbController.set('accounts', source, updated);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const deleteAccount = async (
  publicKeyHex: string,
  source: AccountSource
): Promise<boolean> => {
  try {
    const all = ((await DbController.get('accounts', source)) ||
      []) as ImportedGenericAccount[];
    const updated = all.filter((a) => a.publicKeyHex !== publicKeyHex);
    await DbController.set('accounts', source, updated);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

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
  fromBackup: boolean
) => {
  const relayFlag = (key: string, value: boolean) =>
    sendChromeMessage('sharedState', 'relay', { key, value });

  const getOnlineMode = () =>
    Boolean(SHARED_STATE.get('mode:connected')) &&
    Boolean(SHARED_STATE.get('mode:online'));

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
    if (getOnlineMode()) {
      const res = await APIsController.getConnectedApiOrThrow(chainId);
      const api = res.getApi();
      await AccountsController.syncAccount(account, api);
    }

    // Subscribe new account to all possible subscriptions if setting enabled.
    if (account.queryMulti !== null && !fromBackup) {
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

  // TODO: Update account name in extrinsics window.
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
  const map = new Map<ChainID, SubscriptionTask[]>();
  const all = (await DbController.getAllObjects('chainSubscriptions')) as Map<
    string,
    SubscriptionTask
  >;

  for (const task of all.values()) {
    const { chainId } = task;
    map.has(chainId)
      ? map.set(chainId, [...map.get(chainId)!, task])
      : map.set(chainId, [task]);
  }

  sendChromeMessage('subscriptions', 'setChainSubscriptions', {
    ser: JSON.stringify(Array.from(map.entries())),
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

bootstrap().then(() => {
  console.log('> Bootstrap complete...');
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  switch (message.type) {
    /**
     * Handle database tasks.
     */
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
        case 'getAllBySource': {
          const { source }: { source: AccountSource } = message.payload;
          DbController.get('accounts', source).then((result) =>
            sendResponse(result)
          );
          return true;
        }
        case 'getAll': {
          getAllAccounts().then((result) => sendResponse(result));
          return true;
        }
        case 'delete': {
          const {
            publicKeyHex,
            source,
          }: { publicKeyHex: string; source: AccountSource } = message.payload;
          console.log(`Delete account: ${publicKeyHex}`);
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
          handleImportAddress(genericAccount, encodedAccount, false);
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
          disconnectAPIs().then(() => sendResponse(true));
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
          const route = tabData.viewId;
          const url = chrome.runtime.getURL(`src/tab/index.html#${route}`);

          const isOpen = ACTIVE_TABS.find((t) => t.viewId === route);
          !isOpen && ACTIVE_TABS.push(tabData);

          chrome.tabs.query({}, function (tabs) {
            const cleanUrl = url.split('#')[0];
            const foundTab = tabs.find(
              (tab) => tab.url?.split('#')[0] === cleanUrl
            );
            if (foundTab) {
              TAB_ID && chrome.tabs.update(TAB_ID, { active: true });
              sendChromeMessage('tabs', 'openTab', { tabData });
            } else {
              PENDING_TAB_DATA = tabData;
              chrome.tabs.create({ url }).then((tab) => {
                TAB_ID = tab.id || null;
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
      }
      break;
    }
    /**
     * Handle WalletConnect tasks.
     */
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
  }
});
