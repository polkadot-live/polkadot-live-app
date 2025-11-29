// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ChainEventsService } from '@polkadot-live/core';
import { DbController } from '../../controllers';
import type { Stores } from '../../controllers';
import type {
  ChainEventSubscription,
  FlattenedAccountData,
} from '@polkadot-live/types';

const cmp = (a: ChainEventSubscription, b: ChainEventSubscription) =>
  a.pallet === b.pallet && a.eventName === b.eventName;

export const putChainEvent = async (sub: ChainEventSubscription) => {
  const { chainId } = sub;
  await DbController.set('chainEvents', sub.id, sub);
  ChainEventsService.insert(chainId, sub);
  ChainEventsService.initEventStream(chainId);
};

export const putChainEventForAccount = async (
  account: FlattenedAccountData,
  sub: ChainEventSubscription
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

export const removeAllChainEventsForAccount = async (
  account: FlattenedAccountData
) => {
  const { address, chain: chainId } = account;
  const store: Stores = 'accountChainEvents';
  const key = `${chainId}::${address}`;
  await DbController.delete(store, key);
};

export const removeChainEvent = async (sub: ChainEventSubscription) => {
  const { chainId } = sub;
  await DbController.delete('chainEvents', sub.id);
  ChainEventsService.remove(chainId, sub);
  ChainEventsService.tryStopEventsStream(chainId);
};

export const removeChainEventForAccount = async (
  account: FlattenedAccountData,
  sub: ChainEventSubscription
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

export const updateChainEvent = async (sub: ChainEventSubscription) => {
  const { chainId } = sub;
  await DbController.set('chainEvents', sub.id, sub);
  ChainEventsService.update(chainId, sub);
};
