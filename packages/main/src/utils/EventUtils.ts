// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type {
  EventAccountData,
  EventCallback,
  EventChainData,
} from '@polkadot-live/types/reporter';
import type {
  NominationPoolCommission,
  NominationPoolRoles,
} from '@polkadot-live/types/accounts';

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
      push = filter_nominating_era_rewards(events, event);
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
    case 'subscribe:account:nominating:nominations': {
      push = filter_nominating_nominations(events, event);
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
 * @name filter_nominating_era_rewards
 * @summary The new event is considered a duplicate if another event has
 * a matching address, pending payout and era number.
 */
const filter_nominating_era_rewards = (
  events: EventCallback[],
  event: EventCallback
): boolean => {
  interface Target {
    eraRewards: string;
    era: string;
  }

  const { address } = event.who.data as EventAccountData;
  const { eraRewards, era }: Target = event.data;

  let isUnique = true;

  events.forEach((e) => {
    if (e.taskAction === event.taskAction && e.data) {
      const { address: nextAddress } = e.who.data as EventAccountData;
      const { era: nextEra, eraRewards: nextEraRewards }: Target = e.data;

      if (
        address === nextAddress &&
        era === nextEra &&
        eraRewards === nextEraRewards
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
 * a matching address and commission data.
 */
const filter_nominating_commission = (
  events: EventCallback[],
  event: EventCallback
): boolean => {
  const { address } = event.who.data as EventAccountData;
  const { era, hasChanged }: { era: number; hasChanged: boolean } = event.data;

  let isUnique = true;

  events.forEach((e) => {
    if (e.taskAction === event.taskAction && e.data) {
      const { address: nextAddress } = e.who.data as EventAccountData;
      const {
        era: nextEra,
        hasChanged: nextHasChanged,
      }: { era: number; hasChanged: boolean } = e.data;

      if (
        address === nextAddress &&
        era === nextEra &&
        hasChanged === nextHasChanged
      ) {
        isUnique = false;
      }
    }
  });

  return isUnique;
};

/**
 * @name filter_nominating_nominations
 * @summary The new event is considered a duplicate if another event has
 * a matching address and validator data.
 */
const filter_nominating_nominations = (
  events: EventCallback[],
  event: EventCallback
): boolean => {
  const { address } = event.who.data as EventAccountData;
  const { era, hasChanged }: { era: number; hasChanged: boolean } = event.data;

  let isUnique = true;

  events.forEach((e) => {
    if (e.taskAction === event.taskAction && e.data) {
      const { address: nextAddress } = e.who.data as EventAccountData;
      const {
        era: nextEra,
        hasChanged: nextHasChanged,
      }: { era: number; hasChanged: boolean } = e.data;

      if (
        address === nextAddress &&
        era === nextEra &&
        hasChanged === nextHasChanged
      ) {
        isUnique = false;
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
