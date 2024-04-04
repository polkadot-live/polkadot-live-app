// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js';
import { chainCurrency, chainUnits } from '@/config/chains';
import { formatDistanceToNow } from 'date-fns';
import { planckToUnit } from '@w3ux/utils';
import type { Account } from '@/model/Account';
import type { ChainID } from '@/types/chains';
import type { EventAccountData, EventCallback } from '@/types/reporter';
import type {
  NominationPoolCommission,
  NominationPoolRoles,
} from '@/types/accounts';

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
    case 'subscribe:account:nominating:rewards': {
      push = filter_nominating_rewards(events, event);
      break;
    }
    default:
      push = filter_nomination_pool_commission(events, event);
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
 * @name filter_nomination_pool_commission
 * @summary The new event is considered a duplicate if another event has
 * a matching address and commission data.
 */
const filter_nomination_pool_commission = (
  events: EventCallback[],
  event: EventCallback
): boolean => {
  const { address } = event.who.data as EventAccountData;
  const { changeRate, current, max, throttleFrom }: NominationPoolCommission =
    event.data;

  let isUnique = true;

  events.forEach((e) => {
    if (e.taskAction === event.taskAction && e.data) {
      const { address: nextAddress } = e.who.data as EventAccountData;
      const next: NominationPoolCommission = e.data;

      if (
        address === nextAddress &&
        throttleFrom === next.throttleFrom &&
        max === next.max &&
        JSON.stringify(changeRate) === JSON.stringify(next.changeRate) &&
        JSON.stringify(current) === JSON.stringify(next.current)
      ) {
        isUnique = false;
      }
    }
  });

  return isUnique;
};

/**
 * @name filter_nomination_pool_commission
 * @summary The new event is considered a duplicate if another event has
 * a matching address and era number.
 */
const filter_nominating_rewards = (
  events: EventCallback[],
  event: EventCallback
): boolean => {
  const { address } = event.who.data as EventAccountData;
  const { era } = event.data;

  let isUnique = true;

  events.forEach((e) => {
    if (e.taskAction === event.taskAction && e.data) {
      const { address: nextAddress } = e.who.data as EventAccountData;
      const nextEra: number = event.data.era;

      if (address === nextAddress && era === nextEra) {
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
 * @name getNominationPoolRolesText
 * @summary Text to render for nomination pool roles events.
 */
export const getNominationPoolRolesText = (
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

/**
 * @name getNominationPoolRenamedText
 * @summary Text to render for nomination pool rename events.
 */
export const getNominationPoolRenamedText = (
  curName: string,
  prevName: string
) =>
  curName !== prevName
    ? `Changed from ${prevName} to ${curName}`
    : `${curName}`;

/**
 * @name getNominationPoolStateText
 * @summary Text to render for nomination state events.
 */
export const getNominationPoolStateText = (
  curState: string,
  prevState: string
) =>
  curState !== prevState
    ? `Changed from ${prevState} to ${curState}.`
    : `Current state is ${curState}.`;

/**
 * @name getFreeBalanceText
 * @summary Text to render for transfer events.
 */
export const getFreeBalanceText = (account: Account) => {
  const freeBalance = planckToUnit(
    new BigNumber(account.balance!.free.toString()),
    chainUnits(account.chain)
  );

  return `${freeBalance} ${chainCurrency(account.chain)}`;
};

/**
 * @name getPendingRewardsText
 * @summary Text to render for nomination pool pending rewards events.
 */
export const getPendingRewardsText = (
  chainId: ChainID,
  pendingRewards: BigNumber
) =>
  `${planckToUnit(
    new BigNumber(pendingRewards.toString()),
    chainUnits(chainId)
  )} ${chainCurrency(chainId)}`;

/**
 * @name getNominationPoolCommissionText
 * @summary Text to render for nomination pool commission events.
 */
export const getNominationPoolCommissionText = (
  cur: NominationPoolCommission,
  prev: NominationPoolCommission
) =>
  JSON.stringify(cur.changeRate) === JSON.stringify(prev.changeRate) &&
  JSON.stringify(cur.current) === JSON.stringify(prev.current) &&
  cur.throttleFrom === prev.throttleFrom &&
  cur.max === prev.max
    ? 'Pool commission has changed.'
    : 'Pool commission unchaged.';
