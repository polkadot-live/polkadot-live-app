// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';

export interface AccountStatusesContextInterface {
  ledgerAccountStatuses: Map<string, boolean>;
  readOnlyAccountStatuses: Map<string, boolean>;
  vaultAccountStatuses: Map<string, boolean>;
  wcAccountStatuses: Map<string, boolean>;
  anyProcessing: (genericAccount: ImportedGenericAccount) => boolean;
  setLedgerAccountStatuses: (map: Map<string, boolean>) => void;
  setReadOnlyAccountStatuses: (map: Map<string, boolean>) => void;
  setVaultAccountStatuses: (map: Map<string, boolean>) => void;
  setWcAccountStatuses: (map: Map<string, boolean>) => void;
  setStatusForAccount: (
    enAddress: string,
    source: AccountSource,
    status: boolean
  ) => void;
  getStatusForAccount: (
    enAddress: string,
    source: AccountSource
  ) => boolean | null;
  insertAccountStatus: (enAddress: string, source: AccountSource) => void;
  deleteAccountStatus: (enAddress: string, source: AccountSource) => void;
}
