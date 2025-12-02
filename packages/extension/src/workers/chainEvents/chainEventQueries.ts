// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../../controllers';
import type { Stores } from '../../controllers';
import type {
  ChainEventSubscription,
  FlattenedAccountData,
} from '@polkadot-live/types';

export const getAllChainEvents = async (): Promise<
  ChainEventSubscription[]
> => {
  const store = 'chainEvents';
  const active = (await DbController.getAllObjects(store)) as Map<
    string,
    ChainEventSubscription
  >;
  return Array.from(active.values());
};

export const getAllChainEventsForAccount = async (
  account: FlattenedAccountData
): Promise<ChainEventSubscription[]> => {
  const { address, chain: chainId } = account;
  const store: Stores = 'accountChainEvents';
  const key = `${chainId}::${address}`;
  const active = (await DbController.get(store, key)) as
    | ChainEventSubscription[]
    | undefined;
  return active ?? [];
};

export const getActiveCount = async (): Promise<number> => {
  const store = 'chainEvents';
  const active = (await DbController.getAllObjects(store)) as Map<
    string,
    ChainEventSubscription
  >;
  return Array.from(active.keys()).length;
};
