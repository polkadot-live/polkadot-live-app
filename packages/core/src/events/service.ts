// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { APIsController } from '../controllers';
import {
  handleReferendaEvent,
  handleBalancesEvent,
  handleStakingEvent,
  handleNominationPoolsEvent,
  handleConvictionVotingEvent,
} from './handlers';
import type {
  AssetHubPolkadotRuntimeRuntimeEvent,
  PolkadotAssetHubApi,
} from '@dedot/chaintypes/polkadot-asset-hub';
import type { AssetHubKusamaRuntimeRuntimeEvent } from '@dedot/chaintypes/kusama-asset-hub';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type { DedotClient } from 'dedot';
import type { Unsub } from 'dedot/types';
import type {
  ChainEventSubscription,
  PalletBalancesEvent,
  PalletConvictionVotingEvent,
  PalletNominationPoolsEvent,
  PalletReferendaEvent,
  PalletStakingEvent,
} from '@polkadot-live/types';

type RuntimeEvent =
  | AssetHubPolkadotRuntimeRuntimeEvent
  | AssetHubKusamaRuntimeRuntimeEvent;

interface ActiveMeta {
  eventName: string;
  osNotify: boolean;
}

const ChainPallets: Record<string, string[]> = {
  'Polkadot Asset Hub': [
    'Balances',
    'ConvictionVoting',
    'NominationPools',
    'Referenda',
    'Staking',
  ],
};

const PalletHandlers: Record<string, AnyData> = {
  Balances: (
    chainId: ChainID,
    osNotify: boolean,
    palletEvent: PalletBalancesEvent
  ) => handleBalancesEvent(chainId, osNotify, palletEvent),
  ConvictionVoting: (
    chainId: ChainID,
    osNotify: boolean,
    palletEvent: PalletConvictionVotingEvent
  ) => handleConvictionVotingEvent(chainId, osNotify, palletEvent),
  NominationPools: (
    chainId: ChainID,
    osNotify: boolean,
    palletEvent: PalletNominationPoolsEvent
  ) => handleNominationPoolsEvent(chainId, osNotify, palletEvent),
  Referenda: (
    chainId: ChainID,
    osNotify: boolean,
    palletEvent: PalletReferendaEvent
  ) => handleReferendaEvent(chainId, osNotify, palletEvent),
  Staking: (
    chainId: ChainID,
    osNotify: boolean,
    palletEvent: PalletStakingEvent
  ) => handleStakingEvent(chainId, osNotify, palletEvent),
};

interface ServiceStatus {
  active: boolean;
  unsub: Unsub | null;
}

export class ChainEventsService {
  /**
   * Status of services for supported networks.
   */
  static serviceStatus = new Map<ChainID, ServiceStatus>(
    Object.keys(ChainPallets).map(
      (cid) =>
        [cid as ChainID, { active: false, unsub: null }] as [
          ChainID,
          ServiceStatus,
        ]
    )
  );

  /**
   * Cache of active chain event subscriptions.
   */
  static activeSubscriptions = new Map<ChainID, ChainEventSubscription[]>();

  static cmp = (a: ChainEventSubscription, b: ChainEventSubscription) =>
    a.pallet === b.pallet && a.eventName === b.eventName;

  static insert = (chainId: ChainID, sub: ChainEventSubscription) => {
    const ptr = ChainEventsService.activeSubscriptions;
    const cur = ptr.get(chainId);
    cur ? ptr.set(chainId, [...cur, sub]) : ptr.set(chainId, [sub]);
  };

  static remove = (chainId: ChainID, sub: ChainEventSubscription) => {
    const cmp = ChainEventsService.cmp;
    const ptr = ChainEventsService.activeSubscriptions;
    const cur = ptr.get(chainId);
    const upd = cur?.filter((s) => !cmp(s, sub)) ?? [];
    upd.length ? ptr.set(chainId, upd) : ptr.delete(chainId);
  };

  static update = (chainId: ChainID, sub: ChainEventSubscription) => {
    const cmp = ChainEventsService.cmp;
    const ptr = ChainEventsService.activeSubscriptions;
    const upd = ptr.get(chainId)?.map((s) => (cmp(s, sub) ? sub : s));
    upd && ptr.set(chainId, upd);
  };

  /**
   * Build map of active pallets and event names.
   */
  static buildActiveMap = (chainId: ChainID) => {
    const map = new Map<string, ActiveMeta[]>();
    const active = ChainEventsService.activeSubscriptions.get(chainId) ?? [];
    for (const { pallet, eventName, osNotify } of active) {
      map.has(pallet)
        ? map.set(pallet, [...map.get(pallet)!, { eventName, osNotify }])
        : map.set(pallet, [{ eventName, osNotify }]);
    }
    return map;
  };

  /**
   * Init events stream for a network.
   */
  static initEventStream = async (chainId: ChainID) => {
    const status = ChainEventsService.serviceStatus.get(chainId);
    if (status?.active) {
      return;
    }
    const client = await APIsController.getConnectedApi(chainId);
    if (!client?.api) {
      return;
    }

    const api = client.api as DedotClient<PolkadotAssetHubApi>;
    const unsub = await api.query.system.events((events) => {
      // Support pallets for this network.
      const chainPallets: string[] = ChainPallets[chainId];
      const activeMap = ChainEventsService.buildActiveMap(chainId);

      for (const item of events) {
        const { event }: { event: RuntimeEvent } = item;
        const { pallet } = event;

        // Check if subscription is active for this event.
        const isSupportedPallet = chainPallets.includes(pallet);
        const meta = activeMap
          .get(pallet)
          ?.find((m) => m.eventName === event.palletEvent.name);
        const isOn = meta !== undefined;

        if (isSupportedPallet && isOn) {
          const { palletEvent } = event;
          const osNotify = meta.osNotify;
          const handler = PalletHandlers[pallet];
          handler && handler(chainId, osNotify, palletEvent);
        }
      }
    });
    ChainEventsService.serviceStatus.set(chainId, { active: true, unsub });
  };

  /**
   * Stop events stream for a network.
   */
  static stopEventsStream = (chainId: ChainID) => {
    const status = ChainEventsService.serviceStatus.get(chainId);
    if (!status) {
      return;
    }
    if (status.active && status.unsub) {
      const { unsub } = status;
      unsub && unsub();
      ChainEventsService.serviceStatus.set(chainId, {
        active: false,
        unsub: null,
      });
    }
  };

  /**
   * Stop an event stream if no subscriptions are active.
   */
  static tryStopEventsStream = (chainId: ChainID) => {
    if (!ChainEventsService.activeSubscriptions.get(chainId)) {
      ChainEventsService.stopEventsStream(chainId);
    }
  };
}
