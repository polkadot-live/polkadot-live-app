// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { EventCallback } from '@/types/reporter';

/**
 * @name pushEventAndFilterDuplicates
 * @summary Pushes an event to an array of the same type, and filters out any previous
 * events that are considered redundant or duplicates.
 *
 * This function is called both in the renderer and Electron main process.
 */
export const pushEventAndFilterDuplicates = (
  event: EventCallback,
  events: EventCallback[]
): EventCallback[] => {
  const parsed = JSON.parse(JSON.stringify(event));

  // Check if the new event replaces another persisted event.
  switch (parsed.category) {
    case 'balances': {
      // Perform a filter if event is in balances category.
      events = events.filter((e) => {
        if (e.category === 'balances' && e.data) {
          if (
            parsed.who.address === e.who.address &&
            parsed.data.balances.free === e.data.balances.free &&
            parsed.data.balances.reserved === e.data.balances.reserved &&
            parsed.data.balances.nonce === e.data.balances.nonce
          ) {
            // Duplicate event found, filter out the older one.
            return false;
          } else {
            return true;
          }
        }
        return true;
      });
      break;
    }
    default:
      break;
  }

  // Add event to array.
  events.push(parsed);

  return events;
};
