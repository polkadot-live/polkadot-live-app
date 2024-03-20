// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { AddressesContextInterface } from './types';

export const defaultAddressesContext: AddressesContextInterface = {
  addresses: new Map(),
  setAddresses: (a) => {},
  getAddresses: () => [],
  addressExists: (a) => false,
  importAddress: (n, a) => {},
  removeAddress: (n, a) => {},
  getAddress: (a) => null,
};
