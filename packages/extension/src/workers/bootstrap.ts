// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../controllers';
import {
  APIsController,
  AccountsController,
  disconnectAPIs,
  SubscriptionsController,
  TaskOrchestrator,
  tryApiDisconnect,
  executeOneShot,
} from '@polkadot-live/core';
import { getSupportedSources } from '@polkadot-live/consts/chains';
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
import type { EventCallback } from '@polkadot-live/types/reporter';
import type { NodeEndpoint } from '@polkadot-live/types/apis';
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

/**
 * Bootstrapping
 */

const bootstrap = async () => {
  await DbController.initialize();
};

const initOnlineMode = async () => {
  const value = navigator.onLine;
  SHARED_STATE.set('mode:connected', value);
  SHARED_STATE.set('mode:online', value);

  await chrome.runtime.sendMessage({
    type: 'sharedState',
    task: 'set',
    payload: { key: 'mode:connected' as SyncID, value },
  });
  await chrome.runtime.sendMessage({
    type: 'sharedState',
    task: 'set',
    payload: { key: 'mode:online' as SyncID, value },
  });
};

const initTheme = async () => {
  const key = 'mode:dark';
  const stored = await DbController.get('settings', 'setting:dark-mode');
  const value = Boolean(stored);
  SHARED_STATE.set(key, value);
  const msg = { type: 'sharedState', task: 'set', payload: { key, value } };
  chrome.runtime.sendMessage(msg);
};

const initManagedAccounts = async () => {
  type T = Map<ChainID, StoredAccount[]>;
  const fetched = (await DbController.getAllObjects('managedAccounts')) as T;
  await AccountsController.initialize(BACKEND, fetched);
};

const initSystems = async () => {
  await initOnlineMode();
  await Promise.all([
    initTheme(),
    initManagedAccounts(),
    APIsController.initialize(BACKEND),
  ]);
};

const initSubscriptions = async () => {
  SubscriptionsController.backend = BACKEND;
  await Promise.all([
    AccountsController.initAccountSubscriptions(),
    SubscriptionsController.initChainSubscriptions(),
  ]);
};

/**
 * APIs.
 */

const connectApis = async () => {
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
  const { _address, _chain: key } = json;

  const stored = ((await DbController.get(store, key)) ||
    []) as StoredAccount[];

  const updated = [
    ...stored.filter((a) => a._chain !== key && a._address !== _address),
    json,
  ];
  await DbController.set(store, key, updated);
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
    chrome.runtime.sendMessage({
      type: 'sharedState',
      task: 'relay',
      payload: { key, value },
    });

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

        await AccountsController.removeAllSubscriptions(account);
        const allTasks = SubscriptionsController.getAllSubscriptionsForAccount(
          account,
          'disable'
        );

        for (const task of allTasks) {
          // TODO: Update task.
          console.log(task);
        }
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
      const tasks = SubscriptionsController.getAllSubscriptionsForAccount(
        account,
        status
      );
      await updateAccountSubscriptions(tasks);
      await setAccountSubscriptionsState();
    }

    // Update addresses state and show notification.
    if (!fromBackup) {
      chrome.runtime.sendMessage({
        type: 'managedAccounts',
        task: 'syncState',
      });
      // TODO: show import notification.
    }

    // Send message back to import window to reset account's processing flag.
    relayFlag('account:importing', false);
    chrome.runtime.sendMessage({
      type: 'rawAccount',
      task: 'setProcessing',
      payload: { encoded, generic, status: false, success: true },
    });
  } catch (err) {
    console.error(err);
    relayFlag('account:importing', false);
    chrome.runtime.sendMessage({
      type: 'rawAccount',
      task: 'setProcessing',
      payload: { encoded, generic, status: false, success: false },
    });
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
    chrome.runtime.sendMessage({
      type: 'managedAccounts',
      task: 'syncState',
    });

    const key = `${chainId}:${address}`;
    await DbController.delete('accountSubscriptions', key);
    await setAccountSubscriptionsState();

    // Transition away from rendering toggles.
    chrome.runtime.sendMessage({
      type: 'subscriptions',
      task: 'clearRenderedSubscriptions',
    });

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
    chrome.runtime.sendMessage({
      type: 'managedAccounts',
      task: 'syncState',
    });

    // Update subscription task react state.
    chrome.runtime.sendMessage({
      type: 'subscriptions',
      task: 'updateAccountName',
      payload: { key: `${chainId}:${address}`, newName },
    });
  }

  // TODO: Update and return the relevant events.
  // TODO: Update events React state in main window.
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

  chrome.runtime.sendMessage({
    type: 'subscriptions',
    task: 'setChainSubscriptions',
    payload: JSON.stringify(Array.from(map.entries())),
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

const setAccountSubscriptionsState = async () => {
  const store = 'accountSubscriptions';
  const map = (await DbController.getAllObjects(store)) as Map<
    string,
    SubscriptionTask[]
  >;
  chrome.runtime.sendMessage({
    type: 'subscriptions',
    task: 'setAccountSubscriptions',
    payload: JSON.stringify(Array.from(map.entries())),
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
          const msg = { type: 'sharedState', task: 'set', payload };
          chrome.runtime.sendMessage(msg);
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
        case 'initSubscriptions': {
          initSubscriptions().then(() => {
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
          const tabData: TabData = message.tabData;
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
              const data = { type: 'tabs', task: 'openTab', tabData };
              chrome.runtime.sendMessage(data);
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
          const { event }: { event: EventCallback } = message;
          console.log(`Todo: Remove event ${event.uid}`);
          sendResponse(true);
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
        case 'getAll': {
          const all = SubscriptionsController.getAccountSubscriptions();
          const ser = JSON.stringify(Array.from(all.entries()));
          sendResponse(ser);
          return true;
        }
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
          const all = SubscriptionsController.getChainSubscriptions();
          const ser = JSON.stringify(Array.from(all.entries()));
          sendResponse(ser);
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
      }
      break;
    }
    /**
     * Handle WalletConnect tasks.
     */
    case 'walletConnect:relay': {
      switch (message.task) {
        case 'closeModal': {
          chrome.runtime.sendMessage({
            type: 'walletConnect',
            task: 'closeModal',
          });
          return false;
        }
        case 'openModal': {
          chrome.runtime.sendMessage({
            type: 'walletConnect',
            task: 'openModal',
            payload: message.payload,
          });
          return false;
        }
        case 'setAddresses': {
          chrome.runtime.sendMessage({
            type: 'walletConnect',
            task: 'setAddresses',
            payload: message.payload,
          });
          return false;
        }
      }
      break;
    }
  }
});
