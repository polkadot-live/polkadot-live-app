// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  EncodedAccount,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';

export interface RenameHandlerContextInterface {
  isDialogOpen: (genericAccount: ImportedGenericAccount) => boolean;
  isShowAddressDialogOpen: (key: string) => boolean;
  renameHandler: (
    updatedAccount: ImportedGenericAccount,
    originalAccount: ImportedGenericAccount
  ) => Promise<void>;
  setIsDialogOpen: (
    genericAccount: ImportedGenericAccount,
    flag: boolean
  ) => void;
  setIsShowAddressDialogOpen: (key: string, flag: boolean) => void;
  validateNameInput: (trimmed: string) => boolean;
  setRenameDialogData: (
    encodedAccount: EncodedAccount | null,
    genericAccount: ImportedGenericAccount | null,
    isOpen: boolean
  ) => void;
  getRenameDialogData: () => {
    encodedAccount: EncodedAccount | null;
    genericAccount: ImportedGenericAccount | null;
    isOpen: boolean;
  };
}
