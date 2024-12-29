// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';

export interface WalletConnectContextInterface {
  wcConnecting: boolean;
  wcInitialized: boolean;
  wcSessionActive: boolean;
  wcSessionRestored: boolean;
  connectWc: () => Promise<void>;
  disconnectWcSession: () => Promise<void>;
  wcFetchedAddresses: WcFetchedAddress[];
  setWcFetchedAddresses: React.Dispatch<
    React.SetStateAction<WcFetchedAddress[]>
  >;
  wcNetworks: WcSelectNetwork[];
  setWcNetworks: React.Dispatch<React.SetStateAction<WcSelectNetwork[]>>;
  fetchAddressesFromExistingSession: () => void;
}

export interface WcSelectNetwork {
  caipId: string;
  ChainIcon: AnyData;
  chainId: ChainID;
  selected: boolean;
}

export interface WcFetchedAddress {
  chainId: ChainID;
  encoded: string;
  substrate: string;
  selected: boolean;
}
