// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  EncodedAccount,
  ImportedGenericAccount,
} from '@polkadot-live/types';

export interface ImportHandlerAdapter {
  persist: (genericAccount: ImportedGenericAccount) => Promise<void>;
  postToMain: (
    genericAccount: ImportedGenericAccount,
    encodedAccount: EncodedAccount
  ) => void;
}
