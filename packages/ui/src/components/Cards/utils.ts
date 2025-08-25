// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';

export const getChainIdColor = (chainId: ChainID): string => {
  switch (chainId) {
    case 'Polkadot Relay': {
      return '#e63081';
    }
    case 'Kusama Relay': {
      return 'rgb(133, 113, 177)';
    }
    default: {
      return '#e63081';
    }
  }
};
