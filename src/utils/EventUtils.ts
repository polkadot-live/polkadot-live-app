// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js';
import { getApiInstance } from './ApiUtils';
import type { AnyData } from '@/types/misc';
import type { ChainID } from '@/types/chains';
import type { EventAccountData, EventCallback } from '@/types/reporter';

/**
 * @name getEventChainId
 * @summary Get the associated chain ID for an event.
 */
export const getEventChainId = (event: EventCallback): ChainID =>
  event.who.data.chainId;

/**
 * @name pushUniqueEvent
 * @summary Throws away a new event if a duplicate event is already exists.
 * This function is called for both React state and when persisting events.
 */
export const pushUniqueEvent = (
  event: EventCallback,
  events: EventCallback[]
): EventCallback[] => {
  // Initially mark the event to push.
  let push = true;

  // Check if the new event is a duplicate of another persisted event.
  switch (event.category) {
    /**
     * The new event is considered a duplicate if another event has
     * matching address and balance data.
     */
    case 'balances': {
      interface Target {
        balances: {
          free: BigNumber;
          reserved: BigNumber;
          nonce: BigNumber;
        };
      }

      const { address } = event.who.data as EventAccountData;
      const { balances }: Target = event.data;

      events.forEach((e) => {
        if (e.category === 'balances' && e.data) {
          const { address: nextAddress } = e.who.data as EventAccountData;
          const { balances: nextBalances }: Target = e.data;

          if (
            address === nextAddress &&
            balances.free === nextBalances.free &&
            balances.reserved === nextBalances.reserved &&
            balances.nonce === nextBalances.nonce
          ) {
            push = false;
          }
        }
      });

      break;
    }

    /**
     * The new event is considered a duplicate if another event has
     * a matching address and pending rewards balance.
     */
    case 'nominationPools': {
      interface Target {
        pendingRewards: string;
      }

      const { address } = event.who.data as EventAccountData;
      const { pendingRewards }: Target = event.data;

      events.forEach((e) => {
        if (e.category === 'nominationPools' && e.data) {
          const { address: nextAddress } = e.who.data as EventAccountData;
          const { pendingRewards: nextPendingRewards }: Target = e.data;

          if (
            address === nextAddress &&
            pendingRewards === nextPendingRewards
          ) {
            push = false;
          }
        }
      });

      // If the account has past nomination pool events, make them stale.
      // We don't want the user to try and submit out-of-date extrinsics.
      if (push) {
        events = events.map((e) => {
          if (e.category === 'nominationPools' && e.data) {
            const { address: nextAddress } = e.who.data as EventAccountData;
            address === nextAddress && (e.stale = true);
            return e;
          }
          return e;
        });
      }

      break;
    }
    default:
      break;
  }

  // Add event to array if it's unique.
  if (push) {
    events.push(event);
  }

  return events;
};

/**
 * @name timestampToDate
 * @summary Format a timestamp into a date to render on an event item.
 */
export const timestampToDate = (timestamp: number): string => {
  // Convert timestamp to milliseconds
  const milliseconds = timestamp * 1000;

  // Create a new Date object
  const date = new Date(milliseconds);

  // Get day, month, and year
  const day = date.getDate();
  const month = date.getMonth() + 1; // Note: Months are zero-based
  const year = date.getFullYear();

  // Format day, month, and year as DD/MM/YYYY
  const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;

  return formattedDate;
};

/**
 * @name getNonceForAddress
 * @summary Get the live nonce for an address.
 */
export const getAddressNonce = async (address: string, chainId: ChainID) => {
  const instance = await getApiInstance(chainId);
  const result: AnyData = await instance.api.query.system.account(address);
  return new BigNumber(result.nonce);
};
