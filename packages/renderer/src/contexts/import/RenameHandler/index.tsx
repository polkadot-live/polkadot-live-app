// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { postRenameAccount, renameAccountInStore } from '@polkadot-live/core';
import { createContext, useContext, useState } from 'react';
import { useAddresses } from '@ren/contexts/import/Addresses';
import { renderToast, validateAccountName } from '@polkadot-live/ui/utils';
import type { ImportedGenericAccount } from '@polkadot-live/types/accounts';
import type {
  DialogBulkRenameData,
  DialogManageAccountData,
  DialogRenameData,
  DialogShowAddressData,
  RenameHandlerContextInterface,
} from './types';

export const RenameHandlerContext =
  createContext<RenameHandlerContextInterface>(
    defaults.defaultRenameHandlerContext
  );

export const useRenameHandler = () => useContext(RenameHandlerContext);

export const RenameHandlerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { handleAddressImport, isUniqueAccountName } = useAddresses();

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
      encodedAccount: null,
    });

  const getShowAddressDialogData = () => showAddressDialogState;
  const setShowAddressDialogData = (data: DialogShowAddressData) =>
    setShowAddressDialogState({ ...data });

  /**
   * Rename handler for generic and encoded accounts.
   */
  const renameHandler = async (
    updatedAccount: ImportedGenericAccount,
    originalAccount: ImportedGenericAccount
  ) => {
    await renameAccountInStore(updatedAccount);

    // Update encoded account names in main renderer.
    const { encodedAccounts: updatedEncoded } = updatedAccount;
    for (const encodedAccount of Object.values(updatedEncoded)) {
      const { chainId, alias } = encodedAccount;
      if (alias !== originalAccount.encodedAccounts[chainId].alias) {
        postRenameAccount(encodedAccount);
      }
    }

    // Update import window address state.
    handleAddressImport(updatedAccount);
  };

  /**
   * Validate account name input.
   */
  const validateNameInput = (trimmed: string): boolean => {
    // Handle validation failure.
    if (!validateAccountName(trimmed)) {
      renderToast('Bad account name.', `toast-${trimmed}`, 'error');
      return false;
    }

    // Handle duplicate account name.
    if (!isUniqueAccountName(trimmed)) {
      renderToast(
        'Account name is already in use.',
        `toast-${trimmed}`,
        'error'
      );
      return false;
    }

    return true;
  };

  return (
    <RenameHandlerContext.Provider
      value={{
        getBulkRenameDialogData,
        getManageAccountDialogData,
        getRenameDialogData,
        getShowAddressDialogData,
        renameHandler,
        setBulkRenameDialogData,
        setManageAccountDialogData,
        setRenameDialogData,
        setShowAddressDialogData,
        validateNameInput,
      }}
    >
      {children}
    </RenameHandlerContext.Provider>
  );
};
