// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '..//misc';
import type { ChainID } from '../chains';
import type { HelpItemKey } from '../help';
import type {
  AssetHubPolkadotRuntimeRuntimeEvent,
  FrameSystemEventRecord as PolkadotAssetHubFrameSystemEventRecord,
  PalletBalancesEvent as PolkadotAssetHubBalancesEvent,
  PalletConvictionVotingEvent as PolkadotAssetHubConvictionVotingEvent,
  PalletNominationPoolsEvent as PolkadotAssetHubNominationPoolsEvent,
  PalletReferendaEvent as PolkadotAssetHubReferendaEvent,
  PalletStakingAsyncPalletEvent as PolkadotAssetHubStakingEvent,
} from '@dedot/chaintypes/polkadot-asset-hub';
import type {
  AssetHubKusamaRuntimeRuntimeEvent,
  FrameSystemEventRecord as KusamaAssetHubFrameSystemEventRecord,
  PalletBalancesEvent as KusamaAssetHubBalancesEvent,
  PalletConvictionVotingEvent as KusamaAssetHubConvictionVotingEvent,
  PalletNominationPoolsEvent as KusamaAssetHubNominationPoolsEvent,
  PalletReferendaEvent as KusamaAssetHubReferendaEvent,
  PalletStakingAsyncPalletEvent as KusamaAssetHubStakingEvent,
} from '@dedot/chaintypes/kusama-asset-hub';
import type {
  AssetHubPaseoRuntimeRuntimeEvent,
  FrameSystemEventRecord as PaseoAssetHubFrameSystemEventRecord,
  PalletBalancesEvent as PaseoAssetHubBalancesEvent,
  PalletConvictionVotingEvent as PaseoAssetHubConvictionVotingEvent,
  PalletNominationPoolsEvent as PaseoAssetHubNominationPoolsEvent,
  PalletReferendaEvent as PaseoAssetHubReferendaEvent,
  PalletStakingAsyncPalletEvent as PaseoAssetHubStakingEvent,
} from '@dedot/chaintypes/paseo-asset-hub';

export type RuntimeEvent =
  | AssetHubPolkadotRuntimeRuntimeEvent
  | AssetHubKusamaRuntimeRuntimeEvent
  | AssetHubPaseoRuntimeRuntimeEvent;

export type FrameSystemEventRecord =
  | PolkadotAssetHubFrameSystemEventRecord
  | KusamaAssetHubFrameSystemEventRecord
  | PaseoAssetHubFrameSystemEventRecord;

/**
 * Union event types.
 */
export type PalletBalancesEvent =
  | PolkadotAssetHubBalancesEvent
  | KusamaAssetHubBalancesEvent
  | PaseoAssetHubBalancesEvent;

export type PalletConvictionVotingEvent =
  | PolkadotAssetHubConvictionVotingEvent
  | KusamaAssetHubConvictionVotingEvent
  | PaseoAssetHubConvictionVotingEvent;

export type PalletNominationPoolsEvent =
  | PolkadotAssetHubNominationPoolsEvent
  | KusamaAssetHubNominationPoolsEvent
  | PaseoAssetHubNominationPoolsEvent;

export type PalletReferendaEvent =
  | PolkadotAssetHubReferendaEvent
  | KusamaAssetHubReferendaEvent
  | PaseoAssetHubReferendaEvent;

export type PalletStakingEvent =
  | PolkadotAssetHubStakingEvent
  | KusamaAssetHubStakingEvent
  | PaseoAssetHubStakingEvent;

/**
 * Chain event subscription.
 */
export interface ChainEventSubscription {
  id: string;
  chainId: ChainID;
  kind: 'account' | 'chain';
  pallet: string;
  eventName: string;
  enabled: boolean;
  osNotify: boolean;
  label: string;
  eventData?: Record<string, AnyData>;
  helpKey?: HelpItemKey;
}
