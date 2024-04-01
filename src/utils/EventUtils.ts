// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type BigNumber from 'bignumber.js';
import { formatDistanceToNow } from 'date-fns';
import type { ChainID } from '@/types/chains';
import type { EventAccountData, EventCallback } from '@/types/reporter';
import type { NominationPoolRoles } from '@/types/accounts';

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
): { events: EventCallback[]; updated: boolean } => {
  // Initially mark the event to push.
  let push = true;

  // Check if the new event is a duplicate of another persisted event.
  switch (event.taskAction) {
    case 'subscribe:account:balance': {
      push = filter_query_system_account(events, event);
      break;
    }
    case 'subscribe:account:nominationPools:rewards': {
      push = filter_nomination_pool_rewards(events, event);
      break;
    }
    case 'subscribe:account:nominationPools:state': {
      push = filter_nomination_pool_state(events, event);
      break;
    }
    case 'subscribe:account:nominationPools:renamed': {
      push = filter_nomination_pool_renamed(events, event);
      break;
    }
    case 'subscribe:account:nominationPools:roles': {
      push = filter_nomination_pool_roles(events, event);
      break;
    }
    default:
      break;
  }

  // Add event to array if it's unique.
  let updated = false;

  if (push) {
    events.push(event);
    updated = true;
  }

  return { events, updated };
};

/**
 * @name filter_query_system_account
 * @summary The new event is considered a duplicate if another event has
 * matching address and balance data.
 */
const filter_query_system_account = (
  events: EventCallback[],
  event: EventCallback
) => {
  interface Target {
    balances: {
      free: BigNumber;
      reserved: BigNumber;
      nonce: BigNumber;
    };
  }

  const { address } = event.who.data as EventAccountData;
  const { balances }: Target = event.data;
  let isUnique = true;

  events.forEach((e) => {
    if (e.taskAction === event.taskAction && e.data) {
      const { address: nextAddress } = e.who.data as EventAccountData;
      const { balances: nextBalances }: Target = e.data;

      if (
        address === nextAddress &&
        balances.free === nextBalances.free &&
        balances.reserved === nextBalances.reserved &&
        balances.nonce === nextBalances.nonce
      ) {
        isUnique = false;
      }
    }
  });

  return isUnique;
};

/**
 * @name filter_nomination_pool_rewards
 * @summary The new event is considered a duplicate if another event has
 * a matching address and pending rewards balance.
 */
const filter_nomination_pool_rewards = (
  events: EventCallback[],
  event: EventCallback
) => {
  interface Target {
    pendingRewards: string;
  }

  const { address } = event.who.data as EventAccountData;
  const { pendingRewards }: Target = event.data;
  let isUnique = true;

  events.forEach((e) => {
    if (e.taskAction === event.taskAction && e.data) {
      const { address: nextAddress } = e.who.data as EventAccountData;
      const { pendingRewards: nextPendingRewards }: Target = e.data;

      if (address === nextAddress && pendingRewards === nextPendingRewards) {
        isUnique = false;
      }
    }
  });

  // If the account has past nomination pool events, make them stale.
  // We don't want the user to try and submit out-of-date extrinsics.
  if (isUnique) {
    events = events.map((e) => {
      if (e.taskAction === event.taskAction && e.data) {
        const { address: nextAddress } = e.who.data as EventAccountData;
        address === nextAddress && (e.stale = true);
        return e;
      }
      return e;
    });
  }

  return isUnique;
};

/**
 * @name filter_nomination_pool_state
 * @summary The new event is considered a duplicate if another event has
 * a matching address and nomination pool state.
 */
const filter_nomination_pool_state = (
  events: EventCallback[],
  event: EventCallback
) => {
  interface Target {
    poolState: string;
  }

  const { address } = event.who.data as EventAccountData;
  const { poolState }: Target = event.data;
  let isUnique = true;

  events.forEach((e) => {
    if (e.taskAction === event.taskAction && e.data) {
      const { address: nextAddress } = e.who.data as EventAccountData;
      const { poolState: nextPoolState }: Target = e.data;

      if (address === nextAddress && poolState === nextPoolState) {
        isUnique = false;
      }
    }
  });

  return isUnique;
};

/**
 * @name filter_nomination_pool_renamed
 * @summary The new event is considered a duplicate if another event has
 * a matching address and nomination pool name.
 */
const filter_nomination_pool_renamed = (
  events: EventCallback[],
  event: EventCallback
): boolean => {
  interface Target {
    poolName: string;
  }

  const { address } = event.who.data as EventAccountData;
  const { poolName }: Target = event.data;
  let isUnique = true;

  events.forEach((e) => {
    if (e.taskAction === event.taskAction && e.data) {
      const { address: nextAddress } = e.who.data as EventAccountData;
      const { poolName: nextPoolName }: Target = e.data;

      if (address === nextAddress && poolName === nextPoolName) {
        isUnique = false;
      }
    }
  });

  return isUnique;
};

/**
 * @name filter_nomination_pool_roles
 * @summary The new event is considered a duplicate if another event has
 * a matching address and roles.
 */
const filter_nomination_pool_roles = (
  events: EventCallback[],
  event: EventCallback
): boolean => {
  const { address } = event.who.data as EventAccountData;
  const { depositor, root, nominator, bouncer }: NominationPoolRoles =
    event.data;

  let isUnique = true;

  events.forEach((e) => {
    if (e.taskAction === event.taskAction && e.data) {
      const { address: nextAddress } = e.who.data as EventAccountData;
      const next: NominationPoolRoles = e.data;

      if (
        address === nextAddress &&
        depositor === next.depositor &&
        root === next.root &&
        nominator === next.nominator &&
        bouncer === next.bouncer
      ) {
        isUnique = false;
      }
    }
  });

  return isUnique;
};

/**
 * Other utilities
 */

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
 * @name renderTimeAgo
 * @summary Render "time ago" on a received timestamp using date-fns.
 */
export const renderTimeAgo = (timestamp: number): string => {
  const distance = formatDistanceToNow(timestamp * 1000, {
    includeSeconds: true,
  });
  return `${distance} ago`;
};

/**
 * @name getNominationPoolStateText
 * @summary Text to render for nomination pool state events.
 */
export const getNominationPoolStateText = (
  curState: NominationPoolRoles,
  prevState: NominationPoolRoles
) => {
  // Add changed roles to an array.
  const changedRoles: string[] = [];

  for (const key in curState) {
    const k = key as keyof NominationPoolRoles;
    if (curState[k] !== prevState[k]) {
      changedRoles.push(key);
    }
  }

  // Compute the subtitle depending on if roles have changed.
  const text =
    changedRoles.length === 0
      ? 'Roles remain unchanged.'
      : changedRoles.reduce(
          (acc, r) => (acc === '' ? `${acc} ${r}` : `${acc} + ${r}`),
          ''
        ) + ' changed.';

  return text;
};
