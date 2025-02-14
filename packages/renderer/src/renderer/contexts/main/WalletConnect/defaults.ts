// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { WalletConnectContextInterface } from './types';

export const defaultWalletConnectContext: WalletConnectContextInterface = {
  wcSessionRestored: false,
  connectWc: () => new Promise(() => {}),
  disconnectWcSession: () => new Promise(() => {}),
  fetchAddressesFromExistingSession: () => {},
  wcEstablishSessionForExtrinsic: () => new Promise(() => {}),
  wcSignExtrinsic: () => new Promise(() => {}),
  verifySigningAccount: () => new Promise(() => {}),
};
