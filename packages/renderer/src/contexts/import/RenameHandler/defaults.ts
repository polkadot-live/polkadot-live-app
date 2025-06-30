// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { RenameHandlerContextInterface } from './types';

export const defaultRenameHandlerContext: RenameHandlerContextInterface = {
  isDialogOpen: () => true,
  setIsDialogOpen: () => {},
  renameHandler: () => new Promise(() => {}),
  validateNameInput: () => false,
  isShowAddressDialogOpen: () => false,
  setIsShowAddressDialogOpen: () => {},
  setRenameDialogData: () => {},
  getRenameDialogData: () => ({
    encodedAccount: null,
    genericAccount: null,
    isOpen: false,
  }),
};
