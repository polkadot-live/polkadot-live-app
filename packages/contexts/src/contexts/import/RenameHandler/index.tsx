// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext } from 'react';
import {
  createSafeContextHook,
  renderToast,
  validateAccountName,
} from '../../../utils';
import { useAddresses } from '../Addresses';
import { getRenameHandlerAdapter } from './adapters';
import type { RenameHandlerContextInterface } from '../../../types/import';
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
  const adapter = getRenameHandlerAdapter();
  const { handleAddressImport, isUniqueAccountName } = useAddresses();

  /**
   * Rename handler for generic and encoded accounts.
   */
  const renameHandler = async (
    updatedAccount: ImportedGenericAccount,
    originalAccount: ImportedGenericAccount
  ) => {
    await adapter.handleRename(updatedAccount, originalAccount);
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
