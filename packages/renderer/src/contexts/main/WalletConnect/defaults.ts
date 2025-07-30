// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { WalletConnectContextInterface } from './types';

export const defaultWalletConnectContext: WalletConnectContextInterface = {
  wcSessionRestored: false,
  connectWc: () => new Promise(() => {}),
  disconnectWcSession: () => new Promise(() => {}),
  fetchAddressesFromExistingSession: () => {},
  postApprovedResult: () => {},
  setSigningChain: () => {},
  tryCacheSession: () => new Promise(() => {}),
  wcEstablishSessionForExtrinsic: () => new Promise(() => {}),
  wcSignExtrinsic: () => new Promise(() => {}),
  updateWcTxSignMap: () => {},
  verifySigningAccount: () =>
    new Promise(() => ({ approved: false, errorThrown: false })),
};
