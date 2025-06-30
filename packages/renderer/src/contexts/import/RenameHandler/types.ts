// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  EncodedAccount,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';

export interface RenameDialogData {
  isOpen: boolean;
  encodedAccount: EncodedAccount | null;
  genericAccount: ImportedGenericAccount | null;
}

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
  setRenameDialogData: (data: RenameDialogData) => void;
  getRenameDialogData: () => RenameDialogData;
}
