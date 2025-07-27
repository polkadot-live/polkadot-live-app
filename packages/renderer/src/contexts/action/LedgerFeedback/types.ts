// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  LedgerErrorMeta,
  LedgerFeedbackMessage,
} from '@polkadot-live/types/ledger';

export interface LedgerFeedbackContextInterface {
  message: LedgerFeedbackMessage | null;
  isSigning: boolean;
  clearFeedback: () => void;
  resolveMessage: (errorMeta: LedgerErrorMeta) => void;
  setIsSigning: React.Dispatch<React.SetStateAction<boolean>>;
}
