// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  EncodedAccount,
  ImportedGenericAccount,
} from '@polkadot-live/types';

export interface AddHandlerAdapter {
  postToMain: (
    encodedAccount: EncodedAccount,
    genericAccount: ImportedGenericAccount
  ) => void;
  updateAddressInStore: (account: ImportedGenericAccount) => Promise<void>;
}
