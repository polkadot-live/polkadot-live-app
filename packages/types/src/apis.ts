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
  PaseoApi,
  PaseoAssetHubApi,
  PaseoPeopleApi,
} from '@dedot/chaintypes';

export type NodeEndpoint = `wss://${string}` | 'smoldot';

/**
 * API error status codes.
 */
export type ApiErrorStatusCode =
  | 'ApiUndefined'
  | 'ApiConnectError'
  | 'ApiConnectAborted'
  | 'ApiConnectTimeout'
  | 'CouldNotGetConnectedApi'
  | 'LightClientChainSpecUndefined'
  | 'SmoldotClientUndefined';

/**
 * Data for connection cache.
 */
export interface ApiConnectResult<T extends Error> {
  ack: 'success' | 'failure';
  chainId: ChainID;
  error?: T;
}

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
  | DedotClient<PaseoApi>
  | DedotClient<PaseoAssetHubApi>
  | DedotClient<PaseoPeopleApi>
  | DedotClient<WestendApi>
  | DedotClient<WestendAssetHubApi>
  | DedotClient<WestendPeopleApi>;

/**
 * Dedot clients with staking.
 */
export type DedotStakingClient =
  | DedotClient<PolkadotApi>
  | DedotClient<KusamaApi>
  | DedotClient<PaseoApi>
  | DedotClient<WestendAssetHubApi>;

/**
 * Dedot clients with governance.
 */
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
  paseo: PaseoApi;
  'asset-hub-paseo': PaseoAssetHubApi;
  'people-paseo': PaseoPeopleApi;
  westend: WestendApi;
  westmint: WestendAssetHubApi;
  'people-westend': WestendPeopleApi;
}

/**
 * Mapping from ChainID to client key.
 */
export type ChainToKey<T extends ChainID> = ChainIdToClientKeyMap[T];

export interface ChainIdToClientKeyMap {
  'Polkadot Relay': 'polkadot';
  'Polkadot Asset Hub': 'statemint';
  'Polkadot People': 'people-polkadot';
  'Kusama Relay': 'kusama';
  'Kusama Asset Hub': 'statemine';
  'Kusama People': 'people-kusama';
  'Paseo Relay': 'paseo';
  'Paseo Asset Hub': 'asset-hub-paseo';
  'Paseo People': 'people-paseo';
  'Westend Relay': 'westend';
  'Westend Asset Hub': 'westmint';
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
