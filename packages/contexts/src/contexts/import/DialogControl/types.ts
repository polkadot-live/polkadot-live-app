// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  EncodedAccount,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';

export interface DialogBulkRenameData {
  isOpen: boolean;
  genericAccount: ImportedGenericAccount | null;
}

export interface DialogManageAccountData {
  isOpen: boolean;
  genericAccount: ImportedGenericAccount | null;
}

export interface DialogRenameData {
  isOpen: boolean;
  encodedAccount: EncodedAccount | null;
  genericAccount: ImportedGenericAccount | null;
}

export interface DialogShowAddressData {
  isOpen: boolean;
  address: string | null;
}

export interface DialogControlContextInterface {
  deleteExtrinsicDialogOpen: boolean;
  dialogIsOpen: boolean;
  extrinsicSummaryDialogOpen: boolean;
  findReferendumDialogOpen: boolean;
  importReadOnlyDialogOpen: boolean;
  setDeleteExtrinsicDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setExtrinsicSummaryDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setFindReferendumDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setImportReadOnlyDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  getBulkRenameDialogData: () => DialogBulkRenameData;
  getManageAccountDialogData: () => DialogManageAccountData;
  getRenameDialogData: () => DialogRenameData;
  getShowAddressDialogData: () => DialogShowAddressData;
  setBulkRenameDialogData: (data: DialogBulkRenameData) => void;
  setManageAccountDialogData: (data: DialogManageAccountData) => void;
  setRenameDialogData: (data: DialogRenameData) => void;
  setShowAddressDialogData: (data: DialogShowAddressData) => void;
}
