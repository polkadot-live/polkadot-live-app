// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { APIsController } from '../controllers';
import { ChainPallets } from '@polkadot-live/consts/subscriptions/chainEvents';
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
  FrameSystemEventRecord as PolkadotAssetHubFrameSystemEventRecord,
} from '@dedot/chaintypes/polkadot-asset-hub';
import type {
  AssetHubKusamaRuntimeRuntimeEvent,
  KusamaAssetHubApi,
  FrameSystemEventRecord as KusamaAssetHubFrameSystemEventRecord,
} from '@dedot/chaintypes/kusama-asset-hub';
import type {
  AssetHubPaseoRuntimeRuntimeEvent,
  PaseoAssetHubApi,
  FrameSystemEventRecord as PaseoAssetHubFrameSystemEventRecord,
} from '@dedot/chaintypes/paseo-asset-hub';
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
  | AssetHubKusamaRuntimeRuntimeEvent
  | AssetHubPaseoRuntimeRuntimeEvent;

type FrameSystemEventRecord =
  | PolkadotAssetHubFrameSystemEventRecord
  | KusamaAssetHubFrameSystemEventRecord
  | PaseoAssetHubFrameSystemEventRecord;

interface ActiveMeta {
  eventName: string;
  osNotify: boolean;
}

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

interface QueueItem {
  chainId: ChainID;
  record: FrameSystemEventRecord;
  osNotify: boolean;
}

/**
 * Event queue.
 */
class EventQueue {
  private static queue: QueueItem[] = [];
  private static isProcessing = false;
  private static delay = 750;
  private static maxQueueSize = 500;

  static push(item: QueueItem) {
    if (this.queue.length > this.maxQueueSize) {
      console.warn('EventQueue overflow: trimming oldest events');
      this.queue.splice(0, this.queue.length - this.maxQueueSize);
    }
    this.queue.push(item);
    this.process();
  }

  private static async process() {
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;

    while (this.queue.length > 0) {
      try {
        const { chainId, osNotify, record } = this.queue.shift()!;
        ChainEventsService.processSingleEvent(chainId, osNotify, record);

        // Yield control to allow UI updates to flush.
        if (EventQueue.delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, EventQueue.delay));
        }
      } catch (err) {
        console.error('Error processing event', err);
      }
    }
    this.isProcessing = false;
  }
}

/**
 * Chain events service.
 */
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
    if (status && status.active) {
      return;
    }
    const client = await APIsController.getConnectedApi(chainId);
    if (!client?.api) {
      return;
    }
    switch (chainId) {
      case 'Polkadot Asset Hub': {
        const api = client.api as DedotClient<PolkadotAssetHubApi>;
        const unsub = await api.query.system.events((events) => {
          ChainEventsService.handleEvents(chainId, events);
        });
        ChainEventsService.serviceStatus.set(chainId, { active: true, unsub });
        break;
      }
      case 'Kusama Asset Hub': {
        const api = client.api as DedotClient<KusamaAssetHubApi>;
        const unsub = await api.query.system.events((events) => {
          ChainEventsService.handleEvents(chainId, events);
        });
        ChainEventsService.serviceStatus.set(chainId, { active: true, unsub });
        break;
      }
      case 'Paseo Asset Hub': {
        const api = client.api as DedotClient<PaseoAssetHubApi>;
        const unsub = await api.query.system.events((events) => {
          ChainEventsService.handleEvents(chainId, events);
        });
        ChainEventsService.serviceStatus.set(chainId, { active: true, unsub });
        break;
      }
    }
  };

  /**
   * Process events for a specific chain.
   */
  static handleEvents = (
    chainId: ChainID,
    events: FrameSystemEventRecord[]
  ) => {
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
        EventQueue.push({ chainId, osNotify: meta.osNotify, record: item });
      }
    }
  };

  static processSingleEvent(
    chainId: ChainID,
    osNotify: boolean,
    record: FrameSystemEventRecord
  ) {
    const { event }: { event: RuntimeEvent } = record;
    const { pallet, palletEvent } = event;
    const handler = PalletHandlers[pallet];
    handler && handler(chainId, osNotify, palletEvent);
  }

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
