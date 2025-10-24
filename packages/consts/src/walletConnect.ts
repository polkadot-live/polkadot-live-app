// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type {
  WalletConnectMeta,
  WcErrorStatusCode,
  WcSelectNetwork,
} from '@polkadot-live/types/walletConnect';

export const WC_PROJECT_IDS: Record<'electron' | 'browser', string> = {
  electron: 'ebded8e9ff244ba8b6d173b6c2885d87',
  browser: '7a9464141b46d9ed4423d2b69d72f5ed',
};
export const WC_RELAY_URL = 'wss://relay.walletconnect.com';
export const WC_EVENT_ORIGIN = 'https://verify.walletconnect.org';

// CAIPs
export const WC_POLKADOT_CAIP_ID = '91b171bb158e2d3848fa23a9f1c25182';
export const WC_KUSAMA_CAIP_ID = 'b0a8d493285c2df73290dfb7e61f870f';
export const WC_STATEMINE_CAIP_ID = '48239ef607d7928874027a43a6768920';
export const WC_WESTEND_CAIP_ID = 'e143f23803ac50e8f6f8e62695d1ce9e';
export const WC_WESTMINT_CAIP_ID = '67f9723393ef76214df0118c34bbbd3d';
export const WC_PASEO_ASSET_HUB_CAIP_ID = 'd6eec26135305a8ad257a20d00335728';

export const WcNetworks: WcSelectNetwork[] = [
  {
    caipId: WC_POLKADOT_CAIP_ID,
    chainId: 'Polkadot Relay',
    selected: false,
  },
  {
    caipId: WC_STATEMINE_CAIP_ID,
    chainId: 'Kusama Asset Hub',
    selected: false,
  },
  {
    caipId: WC_PASEO_ASSET_HUB_CAIP_ID,
    chainId: 'Paseo Asset Hub',
    selected: false,
  },
  {
    caipId: WC_WESTMINT_CAIP_ID,
    chainId: 'Westend Asset Hub',
    selected: false,
  },
];

export const WcCaipToChainID: Record<string, ChainID> = {
  [WC_POLKADOT_CAIP_ID]: 'Polkadot Relay',
  [WC_KUSAMA_CAIP_ID]: 'Kusama Relay',
  [WC_STATEMINE_CAIP_ID]: 'Kusama Asset Hub',
  [WC_PASEO_ASSET_HUB_CAIP_ID]: 'Paseo Asset Hub',
  [WC_WESTEND_CAIP_ID]: 'Westend Relay',
  [WC_WESTMINT_CAIP_ID]: 'Westend Asset Hub',
};

export const getWalletConnectChainId = (chainId: ChainID) => {
  switch (chainId) {
    case 'Polkadot Relay':
      return WC_POLKADOT_CAIP_ID;
    case 'Kusama Relay':
      return WC_KUSAMA_CAIP_ID;
    case 'Kusama Asset Hub':
      return WC_STATEMINE_CAIP_ID;
    case 'Paseo Asset Hub':
      return WC_PASEO_ASSET_HUB_CAIP_ID;
    case 'Westend Relay':
      return WC_WESTEND_CAIP_ID;
    case 'Westend Asset Hub':
      return WC_WESTMINT_CAIP_ID;
  }
};

/**
 * WalletConnect error feedback.
 */
export const wcErrorFeedback: Record<WcErrorStatusCode, WalletConnectMeta> = {
  WcAccountNotApproved: {
    ack: 'failure',
    statusCode: 'WcAccountNotApproved',
    body: { msg: 'The signing account is not authorized in the session.' },
  },
  WcCancelPending: {
    ack: 'failure',
    statusCode: 'WcCancelPending',
    body: { msg: 'Cancel the pending signing request to proceed.' },
  },
  WcCatchAll: {
    ack: 'failure',
    statusCode: 'WcCatchAll',
    body: { msg: 'Something went wrong with WalletConnect.' },
  },
  WcCanceledTx: {
    ack: 'failure',
    statusCode: 'WcCanceledTx',
    body: { msg: 'The signing request has been canceled.' },
  },
  WcInsufficientTxData: {
    ack: 'failure',
    statusCode: 'WcInsufficientTxData',
    body: { msg: 'Unable to proceed with signing due to incomplete data.' },
  },
  WcNotInitialized: {
    ack: 'failure',
    statusCode: 'WcNotInitialized',
    body: { msg: 'WalletConnect is unavailable.' },
  },
  WcSessionError: {
    ack: 'failure',
    statusCode: 'WcSessionError',
    body: { msg: 'Establish a new WalletConnect session to proceed.' },
  },
  WcSessionNotFound: {
    ack: 'failure',
    statusCode: 'WcSessionNotFound',
    body: { msg: 'WalletConnect session not found.' },
  },
};
