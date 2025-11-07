// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useState } from 'react';
import { createSafeContextHook } from '../../../utils';
import type {
  DialogBulkRenameData,
  DialogManageAccountData,
  DialogRenameData,
  DialogShowAddressData,
  DialogControlContextInterface,
} from './types';

export const DialogControlContext = createContext<
  DialogControlContextInterface | undefined
>(undefined);

export const useDialogControl = createSafeContextHook(
  DialogControlContext,
  'DialogControlContext'
);

export const DialogControlProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /**
   * Rename dialog.
   */
  const [renameDialogState, setRenameDialogState] = useState<DialogRenameData>({
    isOpen: false,
    encodedAccount: null,
    genericAccount: null,
  });

  const getRenameDialogData = () => renameDialogState;
  const setRenameDialogData = (data: DialogRenameData) => {
    setRenameDialogState({ ...data });
  };

  /**
   * Manage account dialog.
   */
  const [manageAccountDialogState, setManageAccountDialogState] =
    useState<DialogManageAccountData>({
      isOpen: false,
      genericAccount: null,
    });

  const getManageAccountDialogData = () => manageAccountDialogState;
  const setManageAccountDialogData = (data: DialogManageAccountData) =>
    setManageAccountDialogState({ ...data });

  /**
   * Bulk rename dialog.
   */
  const [bulkRenameDialogState, setBulkRenameDialogState] =
    useState<DialogBulkRenameData>({
      isOpen: false,
      genericAccount: null,
    });

  const getBulkRenameDialogData = () => bulkRenameDialogState;
  const setBulkRenameDialogData = (data: DialogBulkRenameData) =>
    setBulkRenameDialogState({ ...data });

  /**
   * Show address dialog.
   */
  const [showAddressDialogState, setShowAddressDialogState] =
    useState<DialogShowAddressData>({
      isOpen: false,
      address: null,
    });

  const getShowAddressDialogData = () => showAddressDialogState;
  const setShowAddressDialogData = (data: DialogShowAddressData) =>
    setShowAddressDialogState({ ...data });

  return (
    <DialogControlContext
      value={{
        getBulkRenameDialogData,
        getManageAccountDialogData,
        getRenameDialogData,
        getShowAddressDialogData,
        setBulkRenameDialogData,
        setManageAccountDialogData,
        setRenameDialogData,
        setShowAddressDialogData,
      }}
    >
      {children}
    </DialogControlContext>
  );
};
