// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { DialogControlContextInterface } from './types';

export const defaultDialogControlContext: DialogControlContextInterface = {
  getBulkRenameDialogData: () => ({
    genericAccount: null,
    isOpen: false,
  }),
  getManageAccountDialogData: () => ({ isOpen: false, genericAccount: null }),
  getRenameDialogData: () => ({
    encodedAccount: null,
    genericAccount: null,
    isOpen: false,
  }),
  getShowAddressDialogData: () => ({
    address: null,
    isOpen: false,
  }),
  setBulkRenameDialogData: () => {},
  setManageAccountDialogData: () => {},
  setRenameDialogData: () => {},
  setShowAddressDialogData: () => {},
};
