// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { WcSelectNetwork } from '@polkadot-live/types/walletConnect';

export interface WalletConnectContextInterface {
  wcSessionRestored: boolean;
  connectWc: (wcNetworks: WcSelectNetwork[]) => Promise<void>;
  disconnectWcSession: () => Promise<void>;
  fetchAddressesFromExistingSession: () => void;
}
