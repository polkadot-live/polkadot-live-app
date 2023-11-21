// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AddressesContextInterface } from './types';

export const defaultAddressesContext: AddressesContextInterface = {
  addresses: {},
  //eslint-disable-next-line
  setAddresses: (a) => {},
  getAddresses: () => [],
  //eslint-disable-next-line
  addressExists: (a) => false,
  //eslint-disable-next-line
  importAddress: (n, a) => {},
  //eslint-disable-next-line
  removeAddress: (n, a) => {},
  //eslint-disable-next-line
  getAddress: (a) => null,
  //eslint-disable-next-line
  formatAccountSs58: (a, f) => null,
};
