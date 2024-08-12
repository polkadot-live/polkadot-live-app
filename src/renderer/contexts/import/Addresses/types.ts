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

  handleAddressImport: (
    source: AccountSource,
    local: LedgerLocalAddress | LocalAddress
  ) => void;
  handleAddressDelete: (source: AccountSource, address: string) => boolean;
  handleAddressRemove: (source: AccountSource, address: string) => void;
  handleAddressAdd: (source: AccountSource, address: string) => void;

  isAlreadyImported: (address: string) => boolean;
  getAddressesOfSource: (
    source: AccountSource
  ) => LocalAddress[] | LedgerLocalAddress[];
}
