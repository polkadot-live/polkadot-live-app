// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { AddressesContextInterface } from './types';

export const defaultAddressesContext: AddressesContextInterface = {
  addresses: {},
  setAddresses: (a) => {},
  getAddresses: () => [],
  addressExists: (a) => false,
  importAddress: (n, a) => {},
  removeAddress: (n, a) => {},
  getAddress: (a) => null,
  formatAccountSs58: (a, f) => null,
};
