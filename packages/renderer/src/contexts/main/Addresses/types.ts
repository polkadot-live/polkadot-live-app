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
  getAddresses: () => FlattenedAccountData[];
  addressExists: (a: string) => boolean;
  importAddress: (
    n: ChainID,
    s: AccountSource,
    a: string,
    b: string,
    fromBackup: boolean
  ) => Promise<void>;
  removeAddress: (n: ChainID, a: string) => Promise<void>;
  getAddress: (a: string) => FlattenedAccountData | null;
  getAllAccountSources: () => AccountSource[];
  getReadableAccountSource: (source: AccountSource) => string;
  getAllAccounts: () => FlattenedAccountData[];
  getSubscriptionCountForAccount: (flattened: FlattenedAccountData) => number;
  getTotalSubscriptionCount: () => number;
}
