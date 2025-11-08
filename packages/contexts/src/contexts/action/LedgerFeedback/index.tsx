// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useState } from 'react';
import { createSafeContextHook } from '../../../utils';
import { useConnections, useOverlay } from '../../common';
import { getLedgerFeedbackAdapter } from './adapters';
import type { ExtrinsicInfo } from '@polkadot-live/types/tx';
import type { LedgerFeedbackContextInterface } from '../../../types/action';
import type {
  LedgerErrorMeta,
  LedgerErrorStatusCode,
  LedgerFeedbackMessage,
  LedgerTask,
} from '@polkadot-live/types/ledger';

export const LedgerFeedbackContext = createContext<
  LedgerFeedbackContextInterface | undefined
>(undefined);

export const useLedgerFeedback = createSafeContextHook(
  LedgerFeedbackContext,
  'LedgerFeedbackContext'
);

export const LedgerFeedbackProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const adapter = getLedgerFeedbackAdapter();
  const { setDisableClose, setStatus: setOverlayStatus } = useOverlay();
  const { relayState } = useConnections();
  const [message, setMessage] = useState<LedgerFeedbackMessage | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  // Clear feedback state.
  const clearFeedback = () => setMessage(null);

  // Get a readable feedback message based on a received status code.
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

  // Set feedback message state based on received status code.
  const resolveMessage = (errorMeta: LedgerErrorMeta) => {
    const { statusCode } = errorMeta;
    setMessage({
      kind: 'error',
      text: getLedgerMessage(statusCode),
    });
  };

  // Send IPC ledger task.
  const handleLedgerTask = (task: LedgerTask, payload: string) => {
    adapter.handleLedgerTask(task, payload);
  };

  // Initiate Ledger sign task.
  const handleSign = (info: ExtrinsicInfo) => {
    setIsSigning(true);
    relayState('extrinsic:building', true);

    adapter.handleSign(
      info,
      getLedgerMessage,
      relayState,
      setDisableClose,
      setIsSigning,
      setOverlayStatus,
      setMessage
    );
  };

  return (
    <LedgerFeedbackContext
      value={{
        message,
        isSigning,
        clearFeedback,
        handleLedgerTask,
        handleSign,
        resolveMessage,
        setIsSigning,
      }}
    >
      {children}
    </LedgerFeedbackContext>
  );
};
