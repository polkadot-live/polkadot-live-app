// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';

export interface WalletConnectContextInterface {
  wcConnecting: boolean;
  wcDisconnecting: boolean;
  //wcFetchedAddresses: WcFetchedAddress[];
  wcInitialized: boolean;
  wcNetworks: WcSelectNetwork[];
  wcSessionRestored: boolean;
  connectWc: () => Promise<void>;
  disconnectWcSession: () => Promise<void>;
  fetchAddressesFromExistingSession: () => void;
  //setWcFetchedAddresses: React.Dispatch<
  //  React.SetStateAction<WcFetchedAddress[]>
  //>;
  setWcNetworks: React.Dispatch<React.SetStateAction<WcSelectNetwork[]>>;
}

export interface WcSelectNetwork {
  caipId: string;
  ChainIcon: AnyData;
  chainId: ChainID;
  selected: boolean;
}

/**
 * @todo Move to types package or import window
 */
export interface WcFetchedAddress {
  chainId: ChainID;
  encoded: string;
  substrate: string;
  selected: boolean;
}
