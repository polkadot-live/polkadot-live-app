// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js';
import { chainCurrency, chainUnits } from '@/config/chains';
import { formatDistanceToNow } from 'date-fns';
import { planckToUnit } from '@w3ux/utils';
import type { ChainID } from '@/types/chains';
import type {
  EventAccountData,
  EventCallback,
  EventChainData,
} from '@/types/reporter';
import type {
  NominationPoolCommission,
  NominationPoolRoles,
  ValidatorData,
} from '@/types/accounts';

/**
 * @name getEventChainId
 * @summary Get the associated chain ID for an event.
 */
export const getEventChainId = (event: EventCallback): ChainID =>
  event.who.data.chainId;

/**
 * @name doRemoveOutdatedEvents
 * @summary Removes outdated events upon receiving a new event.
 * This function is called in both renderer and main processes.
 */
export const doRemoveOutdatedEvents = (
  event: EventCallback,
  all: EventCallback[]
): { updated: boolean; events: EventCallback[] } => {
  const { address, chainId } = event.who.data as EventAccountData;
  const { taskAction } = event;

  const updated = all.filter((ev) => {
    // Keep if it's a chain event.
    if (ev.who.origin === 'chain') {
      return true;
    }

    // Extract data from next event.
    const { taskAction: nextTaskAction } = ev;

    if (ev.who.origin === 'interval' && event.who.origin === 'interval') {
      const { chainId: nextChainId } = ev.who.data as EventChainData;
      const { referendumId: nextReferendumId } = ev.data;
      const { referendumId } = event.data;

      // Remove event if its `referendum id`, `action` and `chain id` are the same.
      if (
        nextReferendumId === referendumId &&
        nextTaskAction === taskAction &&
        nextChainId === chainId
      ) {
        return false;
      }
    } else if (ev.who.origin === 'account' && event.who.origin === 'account') {
      const { address: nextAddress, chainId: nextChainId } = ev.who
        .data as EventAccountData;

      // Remove event if its `action`, `address` and `chain id` are the same.
      if (
        nextTaskAction === taskAction &&
        nextAddress === address &&
        nextChainId === chainId
      ) {
        return false;
      }
    }

    // Otherwise, keep the event.
    return true;
  });

  return { updated: true, events: updated };
};

/**
 * @name pushUniqueEvent
 * @summary Throws away a new event if a duplicate event already exists.
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
    /**
     * Standard Subscriptions
     */
    case 'subscribe:account:balance:free': {
      push = filter_account_balance_free(events, event);
      break;
    }
    case 'subscribe:account:balance:frozen': {
      push = filter_account_balance_frozen(events, event);
      break;
    }
    case 'subscribe:account:balance:reserved': {
      push = filter_account_balance_reserved(events, event);
      break;
    }
    case 'subscribe:account:balance:spendable': {
      push = filter_account_balance_spendable(events, event);
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
    case 'subscribe:account:nominationPools:commission': {
      push = filter_nomination_pool_commission(events, event);
      break;
    }
    case 'subscribe:account:nominating:pendingPayouts': {
      push = filter_nominating_pending_payouts(events, event);
      break;
    }
    case 'subscribe:account:nominating:exposure': {
      push = filter_nominating_exposure(events, event);
      break;
    }
    case 'subscribe:account:nominating:commission': {
      push = filter_nominating_commission(events, event);
      break;
    }
    /**
     * Interval Subscriptions
     */
    case 'subscribe:interval:openGov:referendumVotes': {
      push = filter_openGov_referendumVotes(events, event);
      break;
    }
    case 'subscribe:interval:openGov:decisionPeriod': {
      push = filter_openGov_decisionPeriod(events, event);
      break;
    }
    case 'subscribe:interval:openGov:referendumThresholds': {
      push = filter_openGov_referendumThresholds(events, event);
      break;
    }
    default: {
      break;
    }
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
 *
 * TODO:
 * Fix (something wrong with comparing account data and event data)
 * This filter function is currently not being used.
 */
const filter_account_balance_free = (
  events: EventCallback[],
  event: EventCallback
) => {
  const { address } = event.who.data as EventAccountData;
  const free: string = event.data.free;
  let isUnique = true;

  events.forEach((e) => {
    if (e.taskAction === event.taskAction && e.data) {
      const { address: nextAddress } = e.who.data as EventAccountData;
      const nextFree: string = e.data.free;

      if (address === nextAddress && free === nextFree) {
        isUnique = false;
      }
    }
  });

  return isUnique;
};

/**
 * @name filter_account_balance_frozen
 * @summary Event is duplicate if it matches on address, chain and frozen balance.
 */
const filter_account_balance_frozen = (
  events: EventCallback[],
  event: EventCallback
) => {
  const { address } = event.who.data as EventAccountData;
  const frozen: string = event.data.frozen;
  let isUnique = true;

  events.forEach((e) => {
    if (e.taskAction === event.taskAction && e.data) {
      const { address: nextAddress } = e.who.data as EventAccountData;
      const nextFrozen: string = e.data.frozen;

      if (address === nextAddress && frozen === nextFrozen) {
        isUnique = false;
      }
    }
  });

  return isUnique;
};

/**
 * @name filter_account_balance_reserved
 * @summary Event is duplicate if it matches on address, chain and frozen balance.
 */
const filter_account_balance_reserved = (
  events: EventCallback[],
  event: EventCallback
) => {
  const { address } = event.who.data as EventAccountData;
  const reserved: string = event.data.reserved;
  let isUnique = true;

  events.forEach((e) => {
    if (e.taskAction === event.taskAction && e.data) {
      const { address: nextAddress } = e.who.data as EventAccountData;
      const nextReserved: string = e.data.reserved;

      if (address === nextAddress && reserved === nextReserved) {
        isUnique = false;
      }
    }
  });

  return isUnique;
};

/**
 * @name filter_account_balance_spendable
 * @summary Event is duplicate if it matches on address, chain and spendable balance.
 */
const filter_account_balance_spendable = (
  events: EventCallback[],
  event: EventCallback
) => {
  const { address } = event.who.data as EventAccountData;
  const spendable: string = event.data.spendable;
  let isUnique = true;

  events.forEach((e) => {
    if (e.taskAction === event.taskAction && e.data) {
      const { address: nextAddress } = e.who.data as EventAccountData;
      const nextSpendable: string = e.data.spendable;

      if (address === nextAddress && spendable === nextSpendable) {
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
 * @name filter_nominating_rewards
 * @summary The new event is considered a duplicate if another event has
 * a matching address, pending payout and era number.
 */
const filter_nominating_pending_payouts = (
  events: EventCallback[],
  event: EventCallback
): boolean => {
  interface Target {
    era: string;
    pendingPayout: string;
  }

  const { address } = event.who.data as EventAccountData;
  const { era, pendingPayout }: Target = event.data;

  let isUnique = true;

  events.forEach((e) => {
    if (e.taskAction === event.taskAction && e.data) {
      const { address: nextAddress } = e.who.data as EventAccountData;
      const { era: nextEra, pendingPayout: nextPendingPayout }: Target = e.data;

      if (
        address === nextAddress &&
        era === nextEra &&
        pendingPayout === nextPendingPayout
      ) {
        isUnique = false;
      }
    }
  });

  return isUnique;
};

/**
 * @name filter_nominating_exposure
 * @summary The new event is considered a duplicate if another event has
 * a matching address, era number, and exposed flag.
 */
const filter_nominating_exposure = (
  events: EventCallback[],
  event: EventCallback
): boolean => {
  const { address } = event.who.data as EventAccountData;
  const { era, exposed } = event.data;

  let isUnique = true;

  events.forEach((e) => {
    if (e.taskAction === event.taskAction && e.data) {
      const { address: nextAddress } = e.who.data as EventAccountData;
      const { era: nextEra, exposed: nextExposed } = e.data;

      if (
        address === nextAddress &&
        era === nextEra &&
        exposed === nextExposed
      ) {
        isUnique = false;
      }
    }
  });

  return isUnique;
};

/**
 * @name filter_nominating_commission
 * @summary The new event is considered a duplicate if another event has
 * a matching address and changed validator data.
 */
const filter_nominating_commission = (
  events: EventCallback[],
  event: EventCallback
): boolean => {
  const { address } = event.who.data as EventAccountData;
  const { updated }: { updated: ValidatorData[] } = event.data;

  let isUnique = true;

  events.forEach((e) => {
    if (e.taskAction === event.taskAction && e.data) {
      const { address: nextAddress } = e.who.data as EventAccountData;
      const { updated: nextUpdated }: { updated: ValidatorData[] } = e.data;

      if (address === nextAddress && updated.length === nextUpdated.length) {
        let isSameData = true;

        for (let i = 0; i < updated.length; ++i) {
          const { validatorId: valId1, commission: com1 } = updated[i];
          const { validatorId: valId2, commission: com2 } = nextUpdated[i];

          if (valId1 !== valId2 || com1 !== com2) {
            isSameData = false;
            break;
          }
        }

        if (isSameData) {
          isUnique = false;
        }
      }
    }
  });

  return isUnique;
};

/**
 * @name filter_openGov_referendumVotes
 * @summary The new event is considered a duplicate if another event has
 * a matching action, chain id and referendum id.
 */
const filter_openGov_referendumVotes = (
  events: EventCallback[],
  event: EventCallback
): boolean => {
  const { referendumId, ayeVotes, nayVotes } = event.data;
  const { chainId } = event.who.data as EventChainData;
  let isUnique = true;

  events.forEach((e) => {
    if (e.taskAction === event.taskAction && e.data) {
      const { chainId: nextChainId } = e.who.data as
        | EventChainData
        | EventAccountData;

      const {
        referendumId: nextReferendumId,
        ayeVotes: nextAyeVotes,
        nayVotes: nextNayVotes,
      } = e.data;

      if (
        referendumId === nextReferendumId &&
        chainId === nextChainId &&
        ayeVotes === nextAyeVotes &&
        nayVotes === nextNayVotes
      ) {
        isUnique = false;
      }
    }
  });

  return isUnique;
};

/**
 * @name filter_openGov_decisionPeriod
 * @summary The new event is considered a duplicate if another event has
 * a matching action, chain id and referendum id.
 */
const filter_openGov_decisionPeriod = (
  events: EventCallback[],
  event: EventCallback
): boolean => {
  const { referendumId, formattedTime } = event.data;
  const { chainId } = event.who.data as EventChainData;
  let isUnique = true;

  events.forEach((e) => {
    if (e.taskAction === event.taskAction && e.data) {
      const { chainId: nextChainId } = e.who.data as
        | EventChainData
        | EventAccountData;

      const {
        referendumId: nextReferendumId,
        formattedTime: nextFormattedTime,
      } = e.data;

      if (
        referendumId === nextReferendumId &&
        chainId === nextChainId &&
        formattedTime === nextFormattedTime
      ) {
        isUnique = false;
      }
    }
  });

  return isUnique;
};

/**
 * @name filter_openGov_referendumThresholds
 * @summary The new event is considered a duplicate if another event has
 * a matching action, chain id and referendum id.
 */
const filter_openGov_referendumThresholds = (
  events: EventCallback[],
  event: EventCallback
): boolean => {
  const { referendumId, formattedApp, formattedSup } = event.data;
  const { chainId } = event.who.data as EventChainData;
  let isUnique = true;

  events.forEach((e) => {
    if (e.taskAction === event.taskAction && e.data) {
      const { chainId: nextChainId } = e.who.data as
        | EventChainData
        | EventAccountData;

      const {
        referendumId: nextReferendumId,
        formattedApp: nextformattedApp,
        formattedSup: nextformattedSup,
      } = e.data;

      if (
        referendumId === nextReferendumId &&
        chainId === nextChainId &&
        formattedApp === nextformattedApp &&
        formattedSup === nextformattedSup
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
 * @name getBalanceText
 * @summary Text to render for transfer events.
 */
export const getBalanceText = (balance: BigNumber, chainId: ChainID) => {
  const asUnit = planckToUnit(balance as BigNumber, chainUnits(chainId));
  const regexA = /\.0+$/; // Remove trailing zeros after a decimal point.
  const regexB = /\B(?=(\d{3})+(?!\d))/g; // Insert commas as thousand separators.

  const formatted: string = asUnit
    .toFixed(3)
    .replace(regexA, '')
    .replace(regexB, ',');

  return `${formatted} ${chainCurrency(chainId)}`;
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
  // TODO: Improve text message.
  JSON.stringify(cur.changeRate) === JSON.stringify(prev.changeRate) &&
  JSON.stringify(cur.current) === JSON.stringify(prev.current) &&
  cur.throttleFrom === prev.throttleFrom &&
  cur.max === prev.max
    ? `Pool commission is ${cur.current}.`
    : `Pool commission set to ${cur.current}.`;

/**
 * @name getNominatingPendingPayoutsText
 * @summary Text to render for nominating pending payout events.
 */
export const getNominatingPendingPayoutText = (
  pendingPayout: BigNumber,
  chainId: ChainID
) => {
  const pendingPayoutUnit = planckToUnit(
    pendingPayout as BigNumber,
    chainUnits(chainId)
  );

  return `${pendingPayoutUnit.toString()} ${chainCurrency(chainId)}`;
};
