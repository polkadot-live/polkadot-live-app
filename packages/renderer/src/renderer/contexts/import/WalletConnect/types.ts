// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';

export interface WalletConnectContextInterface {
  initWc: () => Promise<void>;
  wcNetworks: WcSelectNetwork[];
  setWcNetworks: React.Dispatch<React.SetStateAction<WcSelectNetwork[]>>;
}

export interface WcSelectNetwork {
  caipId: string;
  ChainIcon: AnyData;
  chainId: ChainID;
  selected: boolean;
}
