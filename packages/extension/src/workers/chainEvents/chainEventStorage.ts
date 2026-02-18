// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ChainEventsService } from '@polkadot-live/core';
import { DbController } from '../../controllers';
import type {
  ChainEventSubscription,
  FlattenedAccountData,
} from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';
import type { Stores } from '../../controllers';

const cmp = (a: ChainEventSubscription, b: ChainEventSubscription) =>
  a.pallet === b.pallet && a.eventName === b.eventName;

/**
 * Chain-scoped.
 */
export const putChainEvent = async (sub: ChainEventSubscription) => {
  const { chainId } = sub;
  await DbController.set('chainEvents', sub.id, sub);
  ChainEventsService.insert(chainId, sub);
  ChainEventsService.initEventStream(chainId);
};

export const removeChainEvent = async (sub: ChainEventSubscription) => {
  const { chainId } = sub;
  await DbController.delete('chainEvents', sub.id);
  ChainEventsService.remove(chainId, sub);
  ChainEventsService.tryStopEventsStream(chainId);
};

export const updateChainEvent = async (sub: ChainEventSubscription) => {
  const { chainId } = sub;
  await DbController.set('chainEvents', sub.id, sub);
  ChainEventsService.update(chainId, sub);
};

/**
 * Account-scoped.
 */
export const putChainEventForAccount = async (
  account: FlattenedAccountData,
  sub: ChainEventSubscription,
) => {
  const { address, chain: chainId } = account;
  const store: Stores = 'accountChainEvents';
  const key = `${chainId}::${address}`;
  const fetched =
    ((await DbController.get(store, key)) as
      | ChainEventSubscription[]
      | undefined) ?? [];
  const updated = [...fetched.filter((s) => !cmp(sub, s)), sub];
  await DbController.set(store, key, updated);
};

export const removeChainEventForAccount = async (
  account: FlattenedAccountData,
  sub: ChainEventSubscription,
) => {
  const { address, chain: chainId } = account;
  const store: Stores = 'accountChainEvents';
  const key = `${chainId}::${address}`;

  const fetched =
    ((await DbController.get(store, key)) as
      | ChainEventSubscription[]
      | undefined) ?? [];

  const updated = fetched.filter((s) => !cmp(s, sub));
  updated.length
    ? await DbController.set(store, key, updated)
    : await DbController.delete(store, key);
};

export const removeAllChainEventsForAccount = async (
  account: FlattenedAccountData,
) => {
  const { address, chain: chainId } = account;
  const store: Stores = 'accountChainEvents';
  const key = `${chainId}::${address}`;
  await DbController.delete(store, key);
};

/**
 * Referenda-scoped.
 */
export const getActiveRefIds = async (): Promise<string[]> => {
  const res = (await DbController.get('activeRefIds', 'all')) as
    | string[]
    | undefined;
  return Array.from(res ?? []);
};

export const getAllRefSubs = async (): Promise<
  Record<string, Record<number, ChainEventSubscription[]>>
> => {
  const res: Record<string, Record<number, ChainEventSubscription[]>> = {};

  // Merge active subscriptions.
  type T = Map<string, ChainEventSubscription>;
  const all = (await DbController.getAllObjects('referendaChainEvents')) as T;
  for (const [, sub] of all) {
    const [chainId, refIdRaw] = sub.id.split('::');
    const refId = Number(refIdRaw);
    if (Number.isNaN(refId)) {
      continue;
    }
    if (!res[chainId]) {
      res[chainId] = {};
    }
    if (!res[chainId][refId]) {
      res[chainId][refId] = [];
    }
    res[chainId][refId].push(sub);
  }

  // Merge added referenda with no active subscriptions.
  const allActiveRefIds =
    ((await DbController.get('activeRefIds', 'all')) as string[] | undefined) ??
    [];
  for (const id of allActiveRefIds) {
    const [chainId, refIdRaw] = id.split('::');
    const refId = Number(refIdRaw);
    if (Number.isNaN(refId)) {
      continue;
    }
    if (!res[chainId]) {
      res[chainId] = {};
    }
    if (!res[chainId][refId]) {
      res[chainId][refId] = [];
    }
  }
  return res;
};

export const putChainEventsForRef = async (subs: ChainEventSubscription[]) => {
  for (const s of subs) {
    await DbController.set('referendaChainEvents', s.id, s);
  }
};

export const removeChainEventsForRef = async (
  subs: ChainEventSubscription[],
) => {
  for (const s of subs) {
    await DbController.delete('referendaChainEvents', s.id);
  }
};

export const removeAllSubsForRef = async (chainId: ChainID, refId: number) => {
  const cur = await DbController.getAllObjects('referendaChainEvents');
  const tgt = `${chainId}::${refId}`;
  for (const key of cur.keys().filter((k: string) => k.startsWith(tgt))) {
    await DbController.delete('referendaChainEvents', key);
  }
};
