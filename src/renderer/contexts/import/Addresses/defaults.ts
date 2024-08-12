// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { AddressesContextInterface } from './types';
import type { LocalAddress } from '@/types/accounts';

export const defaultAddressesContext: AddressesContextInterface = {
  ledgerAddresses: [],
  readOnlyAddresses: [],
  vaultAddresses: [],
  setLedgerAddresses: (a) => {},
  setReadOnlyAddresses: (a) => {},
  setVaultAddresses: (a) => {},
  isAlreadyImported: () => false,
  getAddressesOfSource: () => [] as LocalAddress[],
};
