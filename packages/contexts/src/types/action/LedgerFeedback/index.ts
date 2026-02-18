// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  LedgerErrorMeta,
  LedgerFeedbackMessage,
  LedgerTask,
} from '@polkadot-live/types/ledger';
import type { ExtrinsicInfo } from '@polkadot-live/types/tx';

export interface LedgerFeedbackContextInterface {
  message: LedgerFeedbackMessage | null;
  isSigning: boolean;
  clearFeedback: () => void;
  handleLedgerTask: (task: LedgerTask, payload: string) => void;
  handleSign: (info: ExtrinsicInfo) => void;
  resolveMessage: (errorMeta: LedgerErrorMeta) => void;
  setIsSigning: React.Dispatch<React.SetStateAction<boolean>>;
}
