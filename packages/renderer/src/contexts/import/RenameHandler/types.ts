// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  EncodedAccount,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';

export interface DialogRenameData {
  isOpen: boolean;
  encodedAccount: EncodedAccount | null;
  genericAccount: ImportedGenericAccount | null;
}

export interface DialogBulkRenameData {
  isOpen: boolean;
  genericAccount: ImportedGenericAccount | null;
}

export interface DialogShowAddressData {
  isOpen: boolean;
  encodedAccount: EncodedAccount | null;
}

export interface RenameHandlerContextInterface {
  renameHandler: (
    updatedAccount: ImportedGenericAccount,
    originalAccount: ImportedGenericAccount
  ) => Promise<void>;
  validateNameInput: (trimmed: string) => boolean;
  getShowAddressDialogData: () => DialogShowAddressData;
  setShowAddressDialogData: (data: DialogShowAddressData) => void;
  setBulkRenameDialogData: (data: DialogBulkRenameData) => void;
  getBulkRenameDialogData: () => DialogBulkRenameData;
  setRenameDialogData: (data: DialogRenameData) => void;
  getRenameDialogData: () => DialogRenameData;
}
