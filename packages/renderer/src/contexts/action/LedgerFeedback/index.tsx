// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useState } from 'react';
import type { LedgerFeedbackContextInterface } from './types';
import type {
  LedgerErrorMeta,
  LedgerErrorStatusCode,
  LedgerFeedbackMessage,
} from '@polkadot-live/types/ledger';

export const LedgerFeedbackContext =
  createContext<LedgerFeedbackContextInterface>(
    defaults.defaultLedgerFeedbackContext
  );

export const useLedgerFeedback = () => useContext(LedgerFeedbackContext);

export const LedgerFeedbackProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [message, setMessage] = useState<LedgerFeedbackMessage | null>(null);

  /**
   * Get a readable feedback message based on a received status code.
   */
  const getLedgerMessage = (statusCode: LedgerErrorStatusCode): string => {
    switch (statusCode) {
      case 'AppNotOpen': {
        return 'Open the Polkadot app on your Ledger device.';
      }
      case 'DeviceLocked': {
        return 'Unlock your Ledger device.';
      }
      case 'DeviceNotConnected':
      case 'TransportUndefined': {
        return 'Connect and unlock your Ledger device.';
      }
      case 'TransactionRejected': {
        return 'Transaction rejected on Ledger device.';
      }
      case 'TxDataUndefined':
      case 'TxLedgerMetaUndefined':
      case 'TxPayloadsUndefined':
      case 'TxDynamicInfoUndefined':
      case 'ValueOutOfRange':
      case 'UnexpectedBufferEnd':
      case 'WrongMetadataDigest': {
        return 'Something went wrong with the transaction data.';
      }
    }
  };

  /**
   * Set feedback message state based on received status code.
   */
  const resolveMessage = (errorMeta: LedgerErrorMeta) => {
    const { statusCode } = errorMeta;
    setMessage({
      kind: 'error',
      text: getLedgerMessage(statusCode),
    });
  };

  return (
    <LedgerFeedbackContext.Provider value={{ message, resolveMessage }}>
      {children}
    </LedgerFeedbackContext.Provider>
  );
};
