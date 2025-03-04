// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { chainIcon } from '@ren/config/chains';
import type { ChainID } from '@polkadot-live/types/chains';
import type { WcSelectNetwork } from '@polkadot-live/types/walletConnect';

export const WC_PROJECT_ID = 'ebded8e9ff244ba8b6d173b6c2885d87';
export const WC_RELAY_URL = 'wss://relay.walletconnect.com';

// CAIPs
export const WC_POLKADOT_CAIP_ID = '91b171bb158e2d3848fa23a9f1c25182';
export const WC_KUSAMA_CAIP_ID = 'b0a8d493285c2df73290dfb7e61f870f';
export const WC_WESTEND_CAIP_ID = 'e143f23803ac50e8f6f8e62695d1ce9e';

export const WcNetworks: WcSelectNetwork[] = [
  {
    caipId: WC_POLKADOT_CAIP_ID,
    ChainIcon: chainIcon('Polkadot'),
    chainId: 'Polkadot',
    selected: false,
  },
  {
    caipId: WC_KUSAMA_CAIP_ID,
    ChainIcon: chainIcon('Kusama'),
    chainId: 'Kusama',
    selected: false,
  },
  {
    caipId: WC_WESTEND_CAIP_ID,
    ChainIcon: chainIcon('Westend'),
    chainId: 'Westend',
    selected: false,
  },
];

export const getWalletConnectChainId = (chainId: ChainID) => {
  switch (chainId) {
    case 'Polkadot':
      return WC_POLKADOT_CAIP_ID;
    case 'Kusama':
      return WC_KUSAMA_CAIP_ID;
    case 'Westend':
      return WC_WESTEND_CAIP_ID;
  }
};
