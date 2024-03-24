// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@/types/chains';
import type { EventAccountData, EventCallback } from '@/types/reporter';

/**
 * @name getEventChainId
 * @summary Get the associated chain ID for an event.
 */
// Utility to get the event's associated ChainID.
export const getEventChainId = (event: EventCallback): ChainID =>
  event.who.data.chainId;

/**
 * @name pushEventAndFilterDuplicates
 * @summary Pushes an event to an array of the same type, and filters out any previous
 * events that are considered redundant or duplicates.
 *
 * This function is called for both React state and when persisting events.
 */
export const pushEventAndFilterDuplicates = (
  event: EventCallback,
  events: EventCallback[]
): EventCallback[] => {
  // Check if the new event replaces another persisted event.
  switch (event.category) {
    case 'balances': {
      // Perform a filter if event is in balances category.
      const address = (event.who.data as EventAccountData).address;

      events = events.filter((e) => {
        if (e.category === 'balances' && e.data) {
          // We know that the event is of origin `account`.
          const nextAddress = (e.who.data as EventAccountData).address;

          if (
            address === nextAddress &&
            event.data.balances.free === e.data.balances.free &&
            event.data.balances.reserved === e.data.balances.reserved &&
            event.data.balances.nonce === e.data.balances.nonce
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
  events.push(event);

  return events;
};
