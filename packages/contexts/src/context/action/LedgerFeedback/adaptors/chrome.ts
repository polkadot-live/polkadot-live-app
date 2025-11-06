// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  LedgerErrorStatusCode,
  LedgerTaskResponse,
} from '@polkadot-live/types';
import type { LedgerFeedbackAdaptor } from './types';

export const chromeAdapter: LedgerFeedbackAdaptor = {
  handleLedgerTask: () => {
    /* empty */
  },

  handleSign: (
    info,
    getLedgerMessage,
    relayState,
    setDisableClose,
    setIsSigning,
    setOverlayStatus,
    setMessage
  ) => {
    chrome.runtime
      .sendMessage({
        type: 'extrinsics',
        task: 'ledgerSignSubmit',
        payload: { info },
      })
      .then((result: LedgerTaskResponse) => {
        setIsSigning(false);
        const { ack, statusCode } = result;
        if (ack === 'success') {
          setDisableClose(false);
          setOverlayStatus(0);
        } else {
          relayState('extrinsic:building', false);
          setMessage({
            kind: 'error',
            text: getLedgerMessage(statusCode as LedgerErrorStatusCode),
          });
        }
      });
  },
};
