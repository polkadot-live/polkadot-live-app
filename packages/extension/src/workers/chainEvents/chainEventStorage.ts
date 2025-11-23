// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ChainEventsService } from '@polkadot-live/core';
import { DbController } from '../../controllers';
import type { ChainEventSubscription } from '@polkadot-live/types';

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
