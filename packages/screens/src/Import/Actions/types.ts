// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ImportedGenericAccount } from '@polkadot-live/types/accounts';

export interface DeleteProps {
  genericAccount: ImportedGenericAccount;
  handleDeleteAddress: (
    genericAccount: ImportedGenericAccount,
  ) => Promise<boolean>;
  setSection: React.Dispatch<React.SetStateAction<number>>;
  setStatus: (s: number) => void;
}
