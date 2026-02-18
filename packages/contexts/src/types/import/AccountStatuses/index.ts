// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';

export interface AccountStatusesContextInterface {
  anyProcessing: (genericAccount: ImportedGenericAccount) => boolean;
  setStatusForAccount: (
    key: string,
    source: AccountSource,
    status: boolean,
  ) => void;
  getStatusForAccount: (key: string, source: AccountSource) => boolean | null;
  deleteAccountStatus: (key: string, source: AccountSource) => void;
}
