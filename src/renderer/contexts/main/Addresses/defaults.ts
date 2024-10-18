// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { AddressesContextInterface } from './types';

export const defaultAddressesContext: AddressesContextInterface = {
  addresses: new Map(),
  setAddresses: (a) => {},
  getAddresses: () => [],
  addressExists: (a) => false,
  importAddress: (n, a) => new Promise(() => {}),
  removeAddress: (n, a) => new Promise(() => {}),
  getAddress: (a) => null,
  getAddressesCountByChain: () => 0,
  getAddressesCountBySource: () => 0,
  getAllAccountSources: () => [],
  getReadableAccountSource: () => '',
};
