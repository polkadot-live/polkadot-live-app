// Copyright 2023 @paritytech/polkadot-live authors & contributors

import { Account } from '@/model/Account';
import { AccountSource, ImportedAccounts } from '@polkadot-live/types';
import { ChainID } from '@polkadot-live/types/chains';

export interface AddressesContextInterface {
  addresses: ImportedAccounts;
  setAddresses: (a: ImportedAccounts) => void;
  getAddresses: () => Account[];
  addressExists: (a: string) => boolean;
  importAddress: (n: ChainID, s: AccountSource, a: string, b: string) => void;
  removeAddress: (n: ChainID, a: string) => void;
  getAddress: (a: string) => Account | null;
  formatAccountSs58: (a: string, f: number) => string | null;
}
