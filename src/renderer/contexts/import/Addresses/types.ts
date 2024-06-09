// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { LedgerLocalAddress, LocalAddress } from '@/types/accounts';

export interface AddressesContextInterface {
  ledgerAddresses: LedgerLocalAddress[];
  readOnlyAddresses: LocalAddress[];
  vaultAddresses: LocalAddress[];
  setLedgerAddresses: React.Dispatch<
    React.SetStateAction<LedgerLocalAddress[]>
  >;
  setReadOnlyAddresses: React.Dispatch<React.SetStateAction<LocalAddress[]>>;
  setVaultAddresses: React.Dispatch<React.SetStateAction<LocalAddress[]>>;
  importAccountJson: (a: LocalAddress) => void;
}
