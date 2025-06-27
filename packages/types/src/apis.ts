// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID, ChainStatus } from './chains';
import type { DedotClient } from 'dedot';
import type {
  KusamaApi,
  KusamaAssetHubApi,
  KusamaPeopleApi,
  PolkadotApi,
  PolkadotAssetHubApi,
  PolkadotPeopleApi,
  WestendApi,
  WestendAssetHubApi,
  WestendPeopleApi,
} from '@dedot/chaintypes';

export type NodeEndpoint = `wss://${string}` | 'smoldot';

/**
 * Chain dodeot clients.
 */
export type DedotClientSet =
  | DedotClient<PolkadotApi>
  | DedotClient<PolkadotAssetHubApi>
  | DedotClient<PolkadotPeopleApi>
  | DedotClient<KusamaApi>
  | DedotClient<KusamaAssetHubApi>
  | DedotClient<KusamaPeopleApi>
  | DedotClient<WestendApi>
  | DedotClient<WestendAssetHubApi>
  | DedotClient<WestendPeopleApi>;

export type DedotStakingClient =
  | DedotClient<PolkadotApi>
  | DedotClient<KusamaApi>
  | DedotClient<WestendAssetHubApi>;

export type DedotOpenGovClient =
  | DedotClient<PolkadotApi>
  | DedotClient<KusamaApi>;

/**
 * Mapping from ID to type
 */
export interface ClientTypes {
  polkadot: PolkadotApi;
  statemint: PolkadotAssetHubApi;
  'people-polkadot': PolkadotPeopleApi;
  kusama: KusamaApi;
  statemine: KusamaAssetHubApi;
  'people-kusama': KusamaPeopleApi;
  westend: WestendApi;
  westmint: WestendAssetHubApi;
  'people-westend': WestendPeopleApi;
}

/**
 * Mapping from ChainID to client key.
 */
export type ChainToKey<T extends ChainID> = ChainIdToClientKeyMap[T];

export interface ChainIdToClientKeyMap {
  Polkadot: 'polkadot';
  Kusama: 'kusama';
  Westend: 'westend';
  'Polkadot Asset Hub': 'statemint';
  'Kusama Asset Hub': 'statemine';
  'Westend Asset Hub': 'westmint';
  'Polkadot People': 'people-polkadot';
  'Kusama People': 'people-kusama';
  'Westend People': 'people-westend';
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
