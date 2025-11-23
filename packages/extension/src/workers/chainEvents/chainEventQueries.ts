// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../../controllers';
import type { ChainEventSubscription } from '@polkadot-live/types';

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
