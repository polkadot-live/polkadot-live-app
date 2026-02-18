// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types';
import type { Dispatch, RefObject, SetStateAction } from 'react';

export interface ImportAddressesAdapter {
  fetchOnMount: () => Promise<Map<AccountSource, ImportedGenericAccount[]>>;
  listenOnMount: (
    setGenericAccounts?: Dispatch<
      SetStateAction<Map<AccountSource, ImportedGenericAccount[]>>
    >,
    genericAccountsRef?: RefObject<
      Map<AccountSource, ImportedGenericAccount[]>
    >,
  ) => (() => void) | null;
}
