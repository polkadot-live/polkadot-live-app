// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  AccountSource,
  FlattenedAccountData,
  FlattenedAccounts,
} from '@/types/accounts';
import type { ChainID } from '@/types/chains';

export interface AddressesContextInterface {
  addresses: FlattenedAccounts;
  setAddresses: (a: FlattenedAccounts) => void;
  getAddresses: () => FlattenedAccountData[];
  addressExists: (a: string) => boolean;
  importAddress: (n: ChainID, s: AccountSource, a: string, b: string) => void;
  removeAddress: (n: ChainID, a: string) => void;
  getAddress: (a: string) => FlattenedAccountData | null;
  formatAccountSs58: (a: string, f: number) => string | null;
}
