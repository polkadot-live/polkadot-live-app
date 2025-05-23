// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID, ChainStatus } from './chains';
import type { DedotClient } from 'dedot';
import type {
  KusamaApi,
  PolkadotApi,
  WestendApi,
  WestendAssetHubApi,
} from '@dedot/chaintypes';

export type NodeEndpoint = `wss://${string}` | 'smoldot';

/**
 * Chain dodeot clients.
 */
export type DedotClientSet =
  | DedotClient<PolkadotApi>
  | DedotClient<KusamaApi>
  | DedotClient<WestendApi>
  | DedotClient<WestendAssetHubApi>;

/**
 * Mapping from ID to type
 */
export interface ClientTypes {
  polkadot: PolkadotApi;
  kusama: KusamaApi;
  westend: WestendApi;
  westmint: WestendAssetHubApi;
}

/*
 * Type for storing essential data for an API instance.
 */
export interface FlattenedAPIData {
  endpoint: NodeEndpoint;
  chainId: ChainID;
  status: ChainStatus;
  rpcs: NodeEndpoint[];
}
