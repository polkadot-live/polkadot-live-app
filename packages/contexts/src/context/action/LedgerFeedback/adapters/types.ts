// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  ExtrinsicInfo,
  LedgerErrorStatusCode,
  LedgerFeedbackMessage,
  LedgerTask,
  SyncID,
} from '@polkadot-live/types';
import type { SetStateAction } from 'react';

export interface LedgerFeedbackAdapter {
  handleLedgerTask: (task: LedgerTask, payload: string) => void;
  handleSign: (
    info: ExtrinsicInfo,
    getLedgerMessage: (statusCode: LedgerErrorStatusCode) => string,
    relayState: (syncId: SyncID, state: boolean | string) => void,
    setDisableClose: (d: boolean) => void,
    setIsSigning: (value: SetStateAction<boolean>) => void,
    setOverlayStatus: (s: number) => void,
    setMessage: (value: SetStateAction<LedgerFeedbackMessage | null>) => void
  ) => void;
}
