// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { AccountStatusesContextInterface } from './types';

export const defaultAccountStatusesContext: AccountStatusesContextInterface = {
  ledgerAccountStatuses: new Map(),
  readOnlyAccountStatuses: new Map(),
  vaultAccountStatuses: new Map(),
  setLedgerAccountStatuses: (map) => {},
  setReadOnlyAccountStatuses: (map) => {},
  setVaultAccountStatuses: (map) => {},
  setStatusForAccount: (address, source, status) => {},
  getStatusForAccount: (address, source) => null,
  insertAccountStatus: (address, source) => {},
  deleteAccountStatus: (address, source) => {},
};
