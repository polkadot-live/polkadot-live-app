// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '@polkadot-live/types/misc';
import { handleAccountMessage } from './handlers/accountMessages';
import { handleAccountSubscriptionMessage } from './handlers/accountSubscriptionMessages';
import { handleApiMessage } from './handlers/apiMessages';
import { handleBootstrapMessage } from './handlers/bootstrapMessages';
import { handleChainSubscriptionMessage } from './handlers/chainSubscriptionMessages';
import { handleDataBackupMessage } from './handlers/dataBackupMessages';
import { handleDbMessage } from './handlers/dbMessages';
import { handleEventMessage } from './handlers/eventMessages';
import { handleExtrinsicMessage } from './handlers/extrinsicMessages';
import { handleIntervalMessage } from './handlers/intervalMessages';
import { handleManagedAccountMessage } from './handlers/managedAccountMessages';
import { handleOneShotMessage } from './handlers/oneShotMessages';
import { handleOpenGovMessage } from './handlers/openGovMessages';
import { handleSettingMessage } from './handlers/settingMessages';
import { handleSharedStateMessage } from './handlers/sharedStateMessages';
import { handleSubscriptionMessage } from './handlers/subscriptionMessages';
import { handleTabMessage } from './handlers/tabMessages';
import { handleWalletConnectMessage } from './handlers/walletConnectMessages';

export const handleMessage = (
  message: AnyData,
  sendResponse: (response?: AnyData) => void
): boolean => {
  const handlerFn = messageHandlerMap[message.type as string];
  return handlerFn ? handlerFn(message, sendResponse) : false;
};

const messageHandlerMap: Record<
  string,
  (message: AnyData, sendResponse: (response?: AnyData) => void) => boolean
> = {
  accountSubscriptions: handleAccountSubscriptionMessage,
  api: handleApiMessage,
  bootstrap: handleBootstrapMessage,
  chainSubscriptions: handleChainSubscriptionMessage,
  dataBackup: handleDataBackupMessage,
  db: handleDbMessage,
  events: handleEventMessage,
  extrinsics: handleExtrinsicMessage,
  intervalSubscriptions: handleIntervalMessage,
  managedAccounts: handleManagedAccountMessage,
  oneShot: handleOneShotMessage,
  openGov: handleOpenGovMessage,
  rawAccount: handleAccountMessage,
  settings: handleSettingMessage,
  subscriptions: handleSubscriptionMessage,
  sharedState: handleSharedStateMessage,
  tabs: handleTabMessage,
  walletConnect: handleWalletConnectMessage,
  'walletConnect:relay': handleWalletConnectMessage,
};
