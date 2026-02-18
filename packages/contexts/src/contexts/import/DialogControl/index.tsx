// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useEffect, useState } from 'react';
import { createSafeContextHook } from '../../../utils';
import type {
  DialogBulkRenameData,
  DialogControlContextInterface,
  DialogManageAccountData,
  DialogRenameData,
  DialogShowAddressData,
} from './types';

export const DialogControlContext = createContext<
  DialogControlContextInterface | undefined
>(undefined);

export const useDialogControl = createSafeContextHook(
  DialogControlContext,
  'DialogControlContext',
);

export const DialogControlProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // True if any dialog is open.
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  /**
   * Accounts tab.
   */

  // Import read-only dialog.
  const [importReadOnlyDialogOpen, setImportReadOnlyDialogOpen] =
    useState(false);

  // Rename dialog.
  const [renameDialogState, setRenameDialogState] = useState<DialogRenameData>({
    isOpen: false,
    encodedAccount: null,
    genericAccount: null,
  });

  const getRenameDialogData = () => renameDialogState;
  const setRenameDialogData = (data: DialogRenameData) => {
    setRenameDialogState({ ...data });
  };

  // Manage account dialog.
  const [manageAccountDialogState, setManageAccountDialogState] =
    useState<DialogManageAccountData>({
      isOpen: false,
      genericAccount: null,
    });

  const getManageAccountDialogData = () => manageAccountDialogState;
  const setManageAccountDialogData = (data: DialogManageAccountData) =>
    setManageAccountDialogState({ ...data });

  // Bulk rename dialog.
  const [bulkRenameDialogState, setBulkRenameDialogState] =
    useState<DialogBulkRenameData>({
      isOpen: false,
      genericAccount: null,
    });

  const getBulkRenameDialogData = () => bulkRenameDialogState;
  const setBulkRenameDialogData = (data: DialogBulkRenameData) =>
    setBulkRenameDialogState({ ...data });

  // Show address dialog.
  const [showAddressDialogState, setShowAddressDialogState] =
    useState<DialogShowAddressData>({
      isOpen: false,
      address: null,
    });

  const getShowAddressDialogData = () => showAddressDialogState;
  const setShowAddressDialogData = (data: DialogShowAddressData) =>
    setShowAddressDialogState({ ...data });

  /**
   * Extrinsics tab.
   */
  const [extrinsicSummaryDialogOpen, setExtrinsicSummaryDialogOpen] =
    useState<boolean>(false);
  const [deleteExtrinsicDialogOpen, setDeleteExtrinsicDialogOpen] =
    useState<boolean>(false);

  /**
   * OpenGov tab.
   */
  const [findReferendumDialogOpen, setFindReferendumDialogOpen] =
    useState(false);

  const someOpen = () =>
    [
      bulkRenameDialogState.isOpen,
      deleteExtrinsicDialogOpen,
      extrinsicSummaryDialogOpen,
      findReferendumDialogOpen,
      importReadOnlyDialogOpen,
      manageAccountDialogState.isOpen,
      renameDialogState.isOpen,
      showAddressDialogState.isOpen,
    ].some(Boolean);

  useEffect(() => {
    setDialogIsOpen(someOpen());
  }, [someOpen()]);

  return (
    <DialogControlContext
      value={{
        deleteExtrinsicDialogOpen,
        dialogIsOpen,
        extrinsicSummaryDialogOpen,
        findReferendumDialogOpen,
        importReadOnlyDialogOpen,
        setDeleteExtrinsicDialogOpen,
        setExtrinsicSummaryDialogOpen,
        setFindReferendumDialogOpen,
        setImportReadOnlyDialogOpen,
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
