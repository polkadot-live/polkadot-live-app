// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  AccountSource,
  LedgerLocalAddress,
  LocalAddress,
} from '@/types/accounts';

export interface AddressesContextInterface {
  ledgerAddresses: LedgerLocalAddress[];
  readOnlyAddresses: LocalAddress[];
  vaultAddresses: LocalAddress[];

  setLedgerAddresses: React.Dispatch<
    React.SetStateAction<LedgerLocalAddress[]>
  >;
  setReadOnlyAddresses: React.Dispatch<React.SetStateAction<LocalAddress[]>>;
  setVaultAddresses: React.Dispatch<React.SetStateAction<LocalAddress[]>>;
  isAlreadyImported: (address: string) => boolean;

  handleAddressImport: (
    source: AccountSource,
    local: LedgerLocalAddress | LocalAddress
  ) => void;
  handleAddressDelete: (source: AccountSource, address: string) => boolean;
  handleAddressRemove: (source: AccountSource, address: string) => void;
  getAddressesOfSource: (
    source: AccountSource
  ) => LocalAddress[] | LedgerLocalAddress[];
}
