// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  WcFetchedAddress,
  WcSelectNetwork,
} from '@polkadot-live/types/walletConnect';

export interface WalletConnectImportContextInterface {
  wcFetchedAddresses: WcFetchedAddress[];
  wcNetworks: WcSelectNetwork[];
  handleConnect: () => Promise<void>;
  handleDisconnect: () => Promise<void>;
  handleFetch: () => void;
  setWcNetworks: React.Dispatch<React.SetStateAction<WcSelectNetwork[]>>;
  setWcFetchedAddresses: React.Dispatch<
    React.SetStateAction<WcFetchedAddress[]>
  >;
}
