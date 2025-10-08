// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../controllers';
import {
  APIsController,
  AccountsController,
  disconnectAPIs,
  SubscriptionsController,
} from '@polkadot-live/core';
import { initSharedState } from '@polkadot-live/consts/sharedState';
import type { ChainID } from '@polkadot-live/types/chains';
import type { NodeEndpoint } from '@polkadot-live/types/apis';
import type { SettingKey } from '@polkadot-live/types/settings';
import type { Stores } from '../controllers';
import type { SyncID, TabData } from '@polkadot-live/types/communication';

/** Shared state */
const SHARED_STATE: Map<SyncID, boolean> = initSharedState();
/** Tab loading */
const BACKEND = 'browser';
let PENDING_TAB_DATA: TabData | null = null;
let TAB_ID: number | null = null;

const bootstrap = async () => {
  await DbController.initialize();
};

const initTheme = async () => {
  const key = 'mode:dark';
  const stored = await DbController.get('settings', 'setting:dark-mode');
  const value = Boolean(stored);
  SHARED_STATE.set(key, value);
  const msg = { type: 'sharedState', task: 'set', payload: { key, value } };
  chrome.runtime.sendMessage(msg);
};

const initSystems = async () => {
  await Promise.all([
    initTheme(),
    APIsController.initialize(BACKEND),
    AccountsController.initialize(BACKEND),
  ]);
};

const initSubscriptions = async () => {
  SubscriptionsController.backend = BACKEND;
  await Promise.all([
    AccountsController.initAccountSubscriptions(),
    SubscriptionsController.initChainSubscriptions(),
  ]);
};

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
        case 'openTabRelay': {
          const tabData: TabData = message.tabData;
          const route = tabData.viewId;
          const url = chrome.runtime.getURL(`src/tab/index.html#${route}`);

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
  }
});
