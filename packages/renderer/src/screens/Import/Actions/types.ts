// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  EncodedAccount,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type { AnyFunction } from '@polkadot-live/types/misc';

export interface ConfirmProps {
  encodedAccount: EncodedAccount;
  genericAccount: ImportedGenericAccount;
}

export interface RemoveProps {
  encodedAccount: EncodedAccount;
  genericAccount: ImportedGenericAccount;
}

export interface DeleteProps {
  genericAccount: ImportedGenericAccount;
  setSection: AnyFunction | null;
}
