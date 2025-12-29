// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../../controllers';
import type {
  EventCallback,
  EventCategory,
} from '@polkadot-live/types/reporter';

export const getAllEvents = async (): Promise<EventCallback[]> => {
  const map = await DbController.getAllObjects('events');
  return Array.from((map as Map<string, EventCallback>).values()).map((e) => e);
};

export const getEvents = async (
  category: EventCategory
): Promise<EventCallback[]> => {
  const map = await DbController.getAllObjects('events');
  return Array.from(map.values()).filter((e) => e.category === category);
};

export const getCounts = async (): Promise<
  Partial<Record<EventCategory, number>>
> => {
  const map = await DbController.getAllObjects('events');
  const result: Partial<Record<EventCategory, number>> = {};
  for (const { category } of (map as Map<string, EventCallback>).values()) {
    result[category] = (result[category] ?? 0) + 1;
  }
  return result;
};
