// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  AssetHubKusamaRuntimeRuntimeEvent,
  PalletBalancesEvent as KusamaAssetHubBalancesEvent,
  PalletConvictionVotingEvent as KusamaAssetHubConvictionVotingEvent,
  FrameSystemEventRecord as KusamaAssetHubFrameSystemEventRecord,
  PalletNominationPoolsEvent as KusamaAssetHubNominationPoolsEvent,
  PalletReferendaEvent as KusamaAssetHubReferendaEvent,
  PalletStakingAsyncPalletEvent as KusamaAssetHubStakingEvent,
} from '@dedot/chaintypes/kusama-asset-hub';
import type {
  AssetHubPaseoRuntimeRuntimeEvent,
  PalletBalancesEvent as PaseoAssetHubBalancesEvent,
  PalletConvictionVotingEvent as PaseoAssetHubConvictionVotingEvent,
  FrameSystemEventRecord as PaseoAssetHubFrameSystemEventRecord,
  PalletNominationPoolsEvent as PaseoAssetHubNominationPoolsEvent,
  PalletReferendaEvent as PaseoAssetHubReferendaEvent,
  PalletStakingAsyncPalletEvent as PaseoAssetHubStakingEvent,
} from '@dedot/chaintypes/paseo-asset-hub';
import type {
  AssetHubPolkadotRuntimeRuntimeEvent,
  PalletBalancesEvent as PolkadotAssetHubBalancesEvent,
  PalletConvictionVotingEvent as PolkadotAssetHubConvictionVotingEvent,
  FrameSystemEventRecord as PolkadotAssetHubFrameSystemEventRecord,
  PalletNominationPoolsEvent as PolkadotAssetHubNominationPoolsEvent,
  PalletReferendaEvent as PolkadotAssetHubReferendaEvent,
  PalletStakingAsyncPalletEvent as PolkadotAssetHubStakingEvent,
} from '@dedot/chaintypes/polkadot-asset-hub';
import type {
  AssetHubWestendRuntimeRuntimeEvent,
  PalletBalancesEvent as WestendAssetHubBalancesEvent,
  PalletConvictionVotingEvent as WestendAssetHubConvictionVotingEvent,
  FrameSystemEventRecord as WestendAssetHubFrameSystemEventRecord,
  PalletNominationPoolsEvent as WestendAssetHubNominationPoolsEvent,
  PalletReferendaEvent as WestendAssetHubReferendaEvent,
  PalletStakingAsyncPalletEvent as WestendAssetHubStakingEvent,
} from '@dedot/chaintypes/westend-asset-hub';
import type { ChainID } from '../chains';
import type { HelpItemKey } from '../help';
import type { AnyData } from '..//misc';

export type RuntimeEvent =
  | AssetHubPolkadotRuntimeRuntimeEvent
  | AssetHubKusamaRuntimeRuntimeEvent
  | AssetHubPaseoRuntimeRuntimeEvent
  | AssetHubWestendRuntimeRuntimeEvent;

export type FrameSystemEventRecord =
  | PolkadotAssetHubFrameSystemEventRecord
  | KusamaAssetHubFrameSystemEventRecord
  | PaseoAssetHubFrameSystemEventRecord
  | WestendAssetHubFrameSystemEventRecord;

/**
 * Union event types.
 */
export type PalletBalancesEvent =
  | PolkadotAssetHubBalancesEvent
  | KusamaAssetHubBalancesEvent
  | PaseoAssetHubBalancesEvent
  | WestendAssetHubBalancesEvent;

export type PalletConvictionVotingEvent =
  | PolkadotAssetHubConvictionVotingEvent
  | KusamaAssetHubConvictionVotingEvent
  | PaseoAssetHubConvictionVotingEvent
  | WestendAssetHubConvictionVotingEvent;

export type PalletNominationPoolsEvent =
  | PolkadotAssetHubNominationPoolsEvent
  | KusamaAssetHubNominationPoolsEvent
  | PaseoAssetHubNominationPoolsEvent
  | WestendAssetHubNominationPoolsEvent;

export type PalletReferendaEvent =
  | PolkadotAssetHubReferendaEvent
  | KusamaAssetHubReferendaEvent
  | PaseoAssetHubReferendaEvent
  | WestendAssetHubReferendaEvent;

export type PalletStakingEvent =
  | PolkadotAssetHubStakingEvent
  | KusamaAssetHubStakingEvent
  | PaseoAssetHubStakingEvent
  | WestendAssetHubStakingEvent;

/**
 * Chain event subscription.
 */
export type EventSubKind = 'account' | 'chain' | 'referendum';

export interface ChainEventSubscription {
  id: string;
  chainId: ChainID;
  kind: EventSubKind;
  pallet: string;
  eventName: string;
  enabled: boolean;
  osNotify: boolean;
  label: string;
  eventData?: Record<string, AnyData>;
  helpKey?: HelpItemKey;
}
