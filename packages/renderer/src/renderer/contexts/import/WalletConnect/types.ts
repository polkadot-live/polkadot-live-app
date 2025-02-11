// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';

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

/**
 * @todo Move to types package or import window
 */
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
