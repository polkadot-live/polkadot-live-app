// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { getSupportedSources } from '@polkadot-live/consts/chains';
import { postRenameAccount, renameAccountInStore } from '@polkadot-live/core';
import { createContext, useContext, useState } from 'react';
import { useAddresses } from '@ren/contexts/import/Addresses';
import { renderToast, validateAccountName } from '@polkadot-live/ui/utils';
import type {
  EncodedAccount,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type { RenameHandlerContextInterface } from './types';

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
  const { handleAddressImport, isUniqueAccountName, getAccounts } =
    useAddresses();

  /**
   * Rename dialog.
   */
  const [renameDialogState, setRenameDialogState] = useState<{
    isOpen: boolean;
    encodedAccount: EncodedAccount | null;
    genericAccount: ImportedGenericAccount | null;
  }>({
    isOpen: false,
    encodedAccount: null,
    genericAccount: null,
  });

  const setRenameDialogData = (
    encodedAccount: EncodedAccount | null,
    genericAccount: ImportedGenericAccount | null,
    isOpen: boolean
  ) => {
    setRenameDialogState({ encodedAccount, genericAccount, isOpen });
  };

  const getRenameDialogData = () => renameDialogState;

  /**
   * Bulk rename dialog.
   */
  const openData: [string, boolean][] = getSupportedSources()
    .map((source) => getAccounts(source))
    .flat()
    .map(({ publicKeyHex }) => [publicKeyHex, false]);

  const [dialogOpen, setDialogOpen] = useState(
    new Map<string, boolean>([...openData])
  );

  /**
   * Show address dialog.
   */
  const showAddressDialogData: [string, boolean][] = getSupportedSources()
    .map((source) => getAccounts(source))
    .flat()
    .map(({ encodedAccounts }) => Object.values(encodedAccounts))
    .flat()
    .map(({ address, chainId }) => [`${chainId}:${address}`, false]);

  const [showAddressDialogOpen, setShowAddressDialogOpen] = useState(
    new Map<string, boolean>([...showAddressDialogData])
  );

  /**
   * Utility to get dialog open flag.
   */
  const isDialogOpen = (genericAccount: ImportedGenericAccount) =>
    Boolean(dialogOpen.get(genericAccount.publicKeyHex));

  const setIsDialogOpen = (
    genericAccount: ImportedGenericAccount,
    flag: boolean
  ) =>
    setDialogOpen((prev) =>
      new Map(prev).set(genericAccount.publicKeyHex, flag)
    );

  const isShowAddressDialogOpen = (key: string) =>
    Boolean(showAddressDialogOpen.get(key));

  const setIsShowAddressDialogOpen = (key: string, flag: boolean) =>
    setShowAddressDialogOpen((prev) => new Map(prev).set(key, flag));

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

    // Update import window address state
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
        isDialogOpen,
        isShowAddressDialogOpen,
        setIsDialogOpen,
        setIsShowAddressDialogOpen,
        renameHandler,
        validateNameInput,
        setRenameDialogData,
        getRenameDialogData,
      }}
    >
      {children}
    </RenameHandlerContext.Provider>
  );
};
