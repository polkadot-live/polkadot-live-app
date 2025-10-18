// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { postRenameAccount, renameAccountInStore } from '@polkadot-live/core';
import { createContext } from 'react';
import { renderToast, validateAccountName } from '@polkadot-live/ui/utils';
import { createSafeContextHook } from '@polkadot-live/contexts';
import { useAddresses } from '@ren/contexts/import/Addresses';
import type { RenameHandlerContextInterface } from '@polkadot-live/contexts/types/import';
import type { ImportedGenericAccount } from '@polkadot-live/types/accounts';

export const RenameHandlerContext = createContext<
  RenameHandlerContextInterface | undefined
>(undefined);

export const useRenameHandler = createSafeContextHook(
  RenameHandlerContext,
  'RenameHandlerContext'
);

export const RenameHandlerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { handleAddressImport, isUniqueAccountName } = useAddresses();

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
    <RenameHandlerContext
      value={{
        renameHandler,
        validateNameInput,
      }}
    >
      {children}
    </RenameHandlerContext>
  );
};
