// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { APIsController } from '../controllers';
import { EventQueue } from './queue';
import { ChainPallets } from '@polkadot-live/consts/subscriptions/chainEvents';
import { PalletHandlers, ScopedAccountGetters } from './handlers';
import type { ChainID } from '@polkadot-live/types/chains';
import type { Unsub } from 'dedot/types';
import type { WhoMeta } from './types';
import type {
  AccountSource,
  AnyData,
  ChainEventSubscription,
  DedotEventStreamClient,
  FlattenedAccountData,
  FrameSystemEventRecord,
  RuntimeEvent,
} from '@polkadot-live/types';

interface ActiveMeta {
  eventName: string;
  osNotify: boolean;
}

interface ServiceStatus {
  active: boolean;
  unsub: Unsub | null;
}

export class ChainEventsService {
  // Status of services for supported networks.
  static serviceStatus = new Map<ChainID, ServiceStatus>(
    Object.keys(ChainPallets).map(
      (cid) =>
        [cid as ChainID, { active: false, unsub: null }] as [
          ChainID,
          ServiceStatus,
        ]
    )
  );

  // Cache chain-scoped event subscriptions.
  static activeSubscriptions = new Map<ChainID, ChainEventSubscription[]>();

  // Cache account-scoped chain event subscriptions.
  static accountScopedSubscriptions = new Map<
    ChainID,
    Map<string /* address */, Map<string /* pallet */, ActiveMeta[]>>
  >();

  // Cache referenda-scoped chain event subscriptions.
  static refScopedSubscriptions = new Map<
    ChainID,
    Map<number /* refId */, ChainEventSubscription[]>
  >();

  static cmp = (a: ChainEventSubscription, b: ChainEventSubscription) =>
    a.pallet === b.pallet && a.eventName === b.eventName;

  static getKeyForAccount = (account: FlattenedAccountData) => {
    const { address, name: alias, chain: chainId, source } = account;
    return `${chainId}::${source}::${alias}::${address}`;
  };

  // Referenda-scoped.
  static insertRefScoped = (refId: number, sub: ChainEventSubscription) => {
    const { chainId, eventName } = sub;
    const scoped = ChainEventsService.refScopedSubscriptions;

    // Get or create Chain -> refId.
    let refs = scoped.get(chainId);
    if (!refs) {
      refs = new Map();
      scoped.set(chainId, refs);
    }
    // Get or create refs -> event array.
    let subs = refs.get(refId);
    if (!subs) {
      subs = [];
      refs.set(refId, subs);
    }
    // Add new subscription.
    if (!subs.find((s) => s.eventName === eventName)) {
      subs.push(sub);
    }
  };

  static removeRefScoped = (refId: number, sub: ChainEventSubscription) => {
    const { chainId, eventName } = sub;
    const scoped = ChainEventsService.refScopedSubscriptions;

    const refs = scoped.get(chainId);
    if (!refs) {
      return;
    }
    const subs = refs.get(refId);
    if (!subs) {
      return;
    }
    // Remove matching sub.
    const filtered = subs.filter((s) => !(s.eventName === eventName));
    filtered.length === 0 ? refs.delete(refId) : refs.set(refId, filtered);

    // If refs map became empty, remove map.
    if (refs.size === 0) {
      scoped.delete(chainId);
    }
  };

  static removeAllRefScoped = (chainId: ChainID, refId: number) => {
    const scoped = ChainEventsService.refScopedSubscriptions;
    const refs = scoped.get(chainId);
    if (!refs) {
      return;
    }
    const subs = refs.get(refId);
    if (!subs) {
      return;
    }
    refs.delete(refId);
    if (!Array.from(refs.keys()).length) {
      scoped.delete(chainId);
    }
    ChainEventsService.tryStopEventsStream(chainId);
  };

  static updateRefScoped = (refId: number, sub: ChainEventSubscription) => {
    const { chainId } = sub;
    const scoped = ChainEventsService.refScopedSubscriptions;
    const cmp = ChainEventsService.cmp;

    const refs = scoped.get(chainId);
    if (!refs) {
      return;
    }
    const subs = refs.get(refId);
    if (!subs) {
      return;
    }
    const updated = subs.map((s) => (cmp(s, sub) ? sub : s));
    refs.set(refId, updated);
  };

  // Account-scoped.
  static insertForAccount = (
    account: FlattenedAccountData,
    sub: ChainEventSubscription
  ) => {
    const { chain: chainId } = account;
    const { pallet, eventName, osNotify } = sub;
    const scoped = ChainEventsService.accountScopedSubscriptions;
    const accKey = ChainEventsService.getKeyForAccount(account);

    // Get or create: chain -> accounts.
    let accounts = scoped.get(chainId);
    if (!accounts) {
      accounts = new Map();
      scoped.set(chainId, accounts);
    }
    // Get or create: account -> pallets.
    let pallets = accounts.get(accKey);
    if (!pallets) {
      pallets = new Map();
      accounts.set(accKey, pallets);
    }
    // Get or create: pallet -> event array.
    let metas = pallets.get(pallet);
    if (!metas) {
      metas = [];
      pallets.set(pallet, metas);
    }
    // Add event metadata.
    if (!metas.find((m) => m.eventName === eventName)) {
      metas.push({ eventName, osNotify });
    }
  };

  static removeForAccount = (
    account: FlattenedAccountData,
    sub: ChainEventSubscription
  ) => {
    const { chain: chainId } = account;
    const { pallet, eventName } = sub;
    const scoped = ChainEventsService.accountScopedSubscriptions;
    const accKey = ChainEventsService.getKeyForAccount(account);

    const accounts = scoped.get(chainId);
    if (!accounts) {
      return;
    }
    const pallets = accounts.get(accKey);
    if (!pallets) {
      return;
    }
    const metas = pallets.get(pallet);
    if (!metas) {
      return;
    }
    // Remove matching meta.
    const filtered = metas.filter((m) => !(m.eventName === eventName));
    filtered.length === 0
      ? pallets.delete(pallet)
      : pallets.set(pallet, filtered);

    // If pallet map became empty, remove account.
    if (pallets.size === 0) {
      accounts.delete(accKey);
    }
    // If account map became empty, remove chain entry.
    if (accounts.size === 0) {
      scoped.delete(chainId);
    }
  };

  static removeAllForAccount = (account: FlattenedAccountData) => {
    const { chain: chainId } = account;
    const scoped = ChainEventsService.accountScopedSubscriptions;
    const accKey = ChainEventsService.getKeyForAccount(account);
    const accounts = scoped.get(chainId);
    if (!accounts) {
      return;
    }
    accounts.delete(accKey);
    if (!Array.from(accounts.keys()).length) {
      scoped.delete(chainId);
    }
    ChainEventsService.tryStopEventsStream(chainId);
  };

  static updateForAccount = (
    account: FlattenedAccountData,
    sub: ChainEventSubscription
  ) => {
    const { chain: chainId } = account;
    const { pallet, eventName, osNotify } = sub;
    const scoped = ChainEventsService.accountScopedSubscriptions;
    const accKey = ChainEventsService.getKeyForAccount(account);

    const accounts = scoped.get(chainId);
    if (!accounts) {
      return;
    }
    const pallets = accounts.get(accKey);
    if (!pallets) {
      return;
    }
    const metas = pallets.get(pallet);
    if (!metas) {
      return;
    }
    // Find index by eventName.
    const index = metas.findIndex((m) => m.eventName === eventName);
    if (index === -1) {
      return;
    }
    // Replace existing entry.
    metas[index] = { eventName, osNotify };
  };

  // Chain-scoped.
  static insert = (chainId: ChainID, sub: ChainEventSubscription) => {
    const cmp = ChainEventsService.cmp;
    const ptr = ChainEventsService.activeSubscriptions;
    const cur = ptr.get(chainId);
    cur
      ? ptr.set(chainId, [...cur.filter((s) => !cmp(s, sub)), sub])
      : ptr.set(chainId, [sub]);
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

  // Build map of active pallets and event names.
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

  // Init events stream for a network.
  static initEventStream = async (chainId: ChainID) => {
    const status = ChainEventsService.serviceStatus.get(chainId);
    if (status && status.active) {
      return;
    }
    const client = await APIsController.getConnectedApi(chainId);
    if (!client?.api) {
      return;
    }
    const api = client.api as DedotEventStreamClient;
    const unsub = (await api.query.system.events((events) => {
      ChainEventsService.handleEvents(chainId, events);
    })) as Unsub;
    ChainEventsService.serviceStatus.set(chainId, { active: true, unsub });
  };

  static hasRefScopedSubscription = (
    chainId: ChainID,
    event: RuntimeEvent
  ): { osNotify: boolean } | null => {
    const { pallet, palletEvent } = event;
    if (pallet !== 'Referenda') {
      return null;
    }
    if (!('index' in event.palletEvent.data)) {
      return null;
    }
    const refs = ChainEventsService.refScopedSubscriptions.get(chainId);
    if (!refs) {
      return null;
    }
    const evRefId = event.palletEvent.data.index;
    const evName = palletEvent.name;
    for (const [refId, subs] of refs.entries()) {
      for (const sub of subs) {
        if (refId === evRefId && evName === sub.eventName) {
          return { osNotify: sub.osNotify };
        }
      }
    }
    return null;
  };

  // Determine if an event has an account-scoped subscription.
  static hasAccountScopedSubscription = (
    chainId: ChainID,
    event: RuntimeEvent
  ): { activeMeta: ActiveMeta; whoMeta: WhoMeta }[] | null => {
    const { pallet, palletEvent } = event;
    const scoped = ChainEventsService.accountScopedSubscriptions;
    const result: { activeMeta: ActiveMeta; whoMeta: WhoMeta }[] = [];

    for (const [accKey, palletMap] of scoped.get(chainId)?.entries() || []) {
      const address = accKey.split('::')[3];
      const meta = palletMap.get(pallet);
      if (meta) {
        const eventName = palletEvent.name;
        const activeMeta = meta.find((m) => m.eventName === eventName);

        if (activeMeta) {
          // Check if `address` is associated with the event.
          const fn = ScopedAccountGetters[pallet] as
            | ((c: ChainID, p: AnyData) => string[])
            | undefined;

          if (!fn) {
            continue;
          }
          if (fn(chainId, palletEvent).includes(address)) {
            const split = accKey.split('::');
            result.push({
              activeMeta,
              whoMeta: {
                chainId: split[0] as ChainID,
                source: split[1] as AccountSource,
                accountName: split[2],
                address: split[3],
              },
            });
          }
        }
      }
    }
    return result.length ? result : null;
  };

  // Process events for a specific chain.
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
      const isSupportedPallet = chainPallets.includes(pallet);

      if (isSupportedPallet) {
        // Check for active account-scoped subscription.
        const maybeMeta = ChainEventsService.hasAccountScopedSubscription(
          chainId,
          event
        );
        // Check for active ref-scoped subscription.
        const maybeRefMeta = ChainEventsService.hasRefScopedSubscription(
          chainId,
          event
        );
        // Check for active chain-scoped subscription.
        const meta = activeMap
          .get(pallet)
          ?.find((m) => m.eventName === event.palletEvent.name);
        const isOn = meta !== undefined;

        // Dispatch event if active subscription found.
        if (maybeMeta !== null) {
          for (const { activeMeta, whoMeta } of maybeMeta) {
            const osNotify = activeMeta.osNotify;
            EventQueue.push({ chainId, osNotify, record: item, whoMeta });
          }
        } else if (maybeRefMeta) {
          const { osNotify } = maybeRefMeta;
          EventQueue.push({ chainId, osNotify, record: item });
        } else if (isOn) {
          const osNotify = Boolean(meta?.osNotify);
          EventQueue.push({ chainId, osNotify, record: item });
        }
      }
    }
  };

  static processSingleEvent(
    chainId: ChainID,
    osNotify: boolean,
    record: FrameSystemEventRecord,
    whoMeta?: WhoMeta
  ) {
    const { event }: { event: RuntimeEvent } = record;
    const { pallet, palletEvent } = event;
    const handler = PalletHandlers[pallet];
    handler && handler(chainId, osNotify, palletEvent, whoMeta);
  }

  // Stop events stream for a network.
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

  static stopAllEventStreams = () => {
    const global = ChainEventsService.activeSubscriptions;
    const accounts = ChainEventsService.accountScopedSubscriptions;
    const refs = ChainEventsService.refScopedSubscriptions;

    const chainIds = Array.from(
      new Set([...global.keys(), ...accounts.keys(), ...refs.keys()])
    );
    for (const chainId of chainIds) {
      ChainEventsService.stopEventsStream(chainId);
    }
  };

  // Stop an event stream if no subscriptions are active.
  static tryStopEventsStream = (chainId: ChainID) => {
    const global = ChainEventsService.activeSubscriptions;
    const accounts = ChainEventsService.accountScopedSubscriptions;
    const refs = ChainEventsService.refScopedSubscriptions;

    if (!global.get(chainId) && !accounts.get(chainId) && !refs.get(chainId)) {
      ChainEventsService.stopEventsStream(chainId);
    }
  };
}
