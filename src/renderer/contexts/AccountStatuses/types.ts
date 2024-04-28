// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface AccountStatusesContextInterface {
  ledgerAccountStatuses: Map<string, boolean>;
  readOnlyAccountStatuses: Map<string, boolean>;
  vaultAccountStatuses: Map<string, boolean>;
  setLedgerAccountStatuses: (map: Map<string, boolean>) => void;
  setReadOnlyAccountStatuses: (map: Map<string, boolean>) => void;
  setVaultAccountStatuses: (map: Map<string, boolean>) => void;
}
