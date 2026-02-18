// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ExtrinsicsController } from '@polkadot-live/core';
import { sendChromeMessage } from '../../utils';
import type { AnyData } from '@polkadot-live/types/misc';

export const handleWalletConnectMessage = (
  message: AnyData,
  sendResponse: (response?: AnyData) => void,
): boolean => {
  switch (message.task) {
    case 'getTxData': {
      const { txId }: { txId: string } = message.payload;
      const result = ExtrinsicsController.getTransactionPayload(txId);
      sendResponse(result?.payload || null);
      return true;
    }
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
    default: {
      console.warn(`Unknown WalletConnect task: ${message.task}`);
      return false;
    }
  }
};
