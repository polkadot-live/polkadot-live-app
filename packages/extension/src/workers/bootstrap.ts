// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../controllers';
import {
  APIsController,
  AccountsController,
  disconnectAPIs,
  SubscriptionsController,
} from '@polkadot-live/core';
import type { ChainID } from '@polkadot-live/types/chains';
import type { NodeEndpoint } from '@polkadot-live/types/apis';
import type { SettingKey } from '@polkadot-live/types/settings';
import type { Stores } from '../controllers';

const BACKEND = 'browser';

const bootstrap = async () => {
  await DbController.initialize();
};

const initSystems = async () => {
  await Promise.all([
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
        case 'closeApi': {
          const { chainId }: { chainId: ChainID } = message;
          closeApi(chainId).then(() => sendResponse(true));
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
        case 'endpointChange': {
          const {
            chainId,
            endpoint,
          }: { chainId: ChainID; endpoint: NodeEndpoint } = message.meta;
          onEndpointChange(chainId, endpoint).then(() => sendResponse(true));
          return true;
        }
      }
      break;
    }
  }
});
