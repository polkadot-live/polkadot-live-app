// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { AddressesContextInterface } from './types';

export const defaultAddressesContext: AddressesContextInterface = {
  getAccounts: () => [],
  getDefaultName: () => '',
  getNextNames: () => [],
  handleAddressImport: () => {},
  handleAddressDelete: () => false,
  handleAddressUpdate: () => {},
  isAlreadyImported: () => false,
  isUniqueAccountName: () => false,
};
