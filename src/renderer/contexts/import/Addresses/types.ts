// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  AccountJson,
  LedgerLocalAddress,
  LocalAddress,
} from '@/types/accounts';

export interface AddressesContextInterface {
  ledgerAddresses: LedgerLocalAddress[];
  readOnlyAddresses: LocalAddress[];
  vaultAddresses: LocalAddress[];
  setLedgerAddresses: (a: LedgerLocalAddress[]) => void;
  setReadOnlyAddresses: (a: LocalAddress[]) => void;
  setVaultAddresses: (a: LocalAddress[]) => void;
  importAccountJson: (a: AccountJson) => void;
}
