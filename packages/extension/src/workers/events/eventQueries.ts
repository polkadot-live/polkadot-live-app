// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../../controllers';
import type {
  EventCallback,
  EventCategory,
  EventFetchPayload,
} from '@polkadot-live/types/reporter';

export const getAllEvents = async (): Promise<EventCallback[]> => {
  const map = await DbController.getAllObjects('events');
  return Array.from((map as Map<string, EventCallback>).values()).map((e) => e);
};

export const getEvents = async (
  payload: EventFetchPayload,
): Promise<EventCallback[]> => {
  const { category, limit, order, cursor } = payload;
  const map = (await DbController.getAllObjects('events')) as Map<
    string,
    EventCallback
  >;

  const all = Array.from(map.values())
    .filter((e) => e.category === category)
    .sort((a, b) => {
      if (a.timestamp === b.timestamp) {
        return order === 'desc'
          ? b.uid.localeCompare(a.uid)
          : a.uid.localeCompare(b.uid);
      }
      return order === 'desc'
        ? b.timestamp - a.timestamp
        : a.timestamp - b.timestamp;
    });

  if (!cursor) {
    return all.slice(0, limit);
  }

  const filterDesc = (e: EventCallback) =>
    e.timestamp < cursor.timestamp ||
    (e.timestamp === cursor.timestamp && e.uid < cursor.uid);

  const filterAsc = (e: EventCallback) =>
    e.timestamp > cursor.timestamp ||
    (e.timestamp === cursor.timestamp && e.uid > cursor.uid);

  const page = all.filter(order === 'desc' ? filterDesc : filterAsc);
  return page.slice(0, limit);
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
