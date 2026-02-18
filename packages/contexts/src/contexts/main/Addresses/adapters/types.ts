// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { FlattenedAccounts } from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';
import type { Dispatch, RefObject, SetStateAction } from 'react';

export interface AddressesAdapter {
  importAddress: (
    accountName: string,
    fromBackup: boolean,
    addressesRef: RefObject<FlattenedAccounts>,
    setAddresses: Dispatch<SetStateAction<FlattenedAccounts>>,
  ) => Promise<void>;
  onMount: (
    addressesRef: RefObject<FlattenedAccounts>,
    setAddresses: Dispatch<SetStateAction<FlattenedAccounts>>,
  ) => void;
  listenOnMount: (
    addressesRef: RefObject<FlattenedAccounts>,
    setAddresses: Dispatch<SetStateAction<FlattenedAccounts>>,
  ) => (() => void) | null;
  removeAddress: (chainId: ChainID, address: string) => void;
}
