// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  AccountSource,
  FlattenedAccountData,
  FlattenedAccounts,
} from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';

export interface AddressesContextInterface {
  addresses: FlattenedAccounts;
  addressExists: (address: string, chainId: ChainID) => boolean;
  getAddress: (
    address: string,
    chainId: ChainID
  ) => FlattenedAccountData | null;
  getAddresses: () => FlattenedAccountData[];
  getAllAccounts: () => FlattenedAccountData[];
  importAddress: (
    n: ChainID,
    s: AccountSource,
    a: string,
    b: string,
    fromBackup: boolean
  ) => Promise<void>;
  removeAddress: (chainId: ChainID, address: string) => Promise<void>;
  getReadableAccountSource: (source: AccountSource) => string;
  getSubscriptionCountForAccount: (flattened: FlattenedAccountData) => number;
  getTotalSubscriptionCount: () => number;
}
