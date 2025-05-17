// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ExtrinsicInfo } from '@polkadot-live/types/tx';
import type { WcSelectNetwork } from '@polkadot-live/types/walletConnect';
import type { ChainID } from '@polkadot-live/types/chains';

export interface WalletConnectContextInterface {
  wcSessionRestored: boolean;
  connectWc: (wcNetworks: WcSelectNetwork[]) => Promise<void>;
  disconnectWcSession: () => Promise<void>;
  fetchAddressesFromExistingSession: () => void;
  wcEstablishSessionForExtrinsic: (
    signingAddress: string,
    chainId: ChainID
  ) => Promise<void>;
  wcSignExtrinsic: (info: ExtrinsicInfo) => Promise<void>;
  updateWcTxSignMap: (txId: string, flag: boolean) => void;
  verifySigningAccount: (target: string, chainId: ChainID) => Promise<void>;
}
