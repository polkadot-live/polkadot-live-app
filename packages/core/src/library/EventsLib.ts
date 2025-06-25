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
  const args: [EventCallback[], EventCallback] = [events, event];

  // Check if the new event is a duplicate of another persisted event.
  switch (event.taskAction) {
    /**
     * Standard Subscriptions
     */
    case 'subscribe:account:balance:free':
      push = filter_account_balance_free(...args);
      break;
    case 'subscribe:account:balance:frozen':
      push = filter_account_balance_frozen(...args);
      break;
    case 'subscribe:account:balance:reserved':
      push = filter_account_balance_reserved(...args);
      break;
    case 'subscribe:account:balance:spendable':
      push = filter_account_balance_spendable(...args);
      break;
    case 'subscribe:account:nominationPools:rewards':
      push = filter_nomination_pool_rewards(...args);
      break;
    case 'subscribe:account:nominationPools:state':
      push = filter_nomination_pool_state(...args);
      break;
    case 'subscribe:account:nominationPools:renamed':
      push = filter_nomination_pool_renamed(...args);
      break;
    case 'subscribe:account:nominationPools:roles':
      push = filter_nomination_pool_roles(...args);
      break;
    case 'subscribe:account:nominationPools:commission':
      push = filter_nomination_pool_commission(...args);
      break;
    case 'subscribe:account:nominating:pendingPayouts':
      push = filter_nominating_era_rewards(...args);
      break;
    case 'subscribe:account:nominating:exposure':
      push = filter_nominating_exposure(...args);
      break;
    case 'subscribe:account:nominating:commission':
      push = filter_nominating_commission(...args);
      break;
    case 'subscribe:account:nominating:nominations':
      push = filter_nominating_nominations(...args);
      break;

    /**
     * Interval Subscriptions
     */
    case 'subscribe:interval:openGov:referendumVotes':
      push = filter_openGov_referendumVotes(...args);
      break;
    case 'subscribe:interval:openGov:decisionPeriod':
      push = filter_openGov_decisionPeriod(...args);
      break;
    case 'subscribe:interval:openGov:referendumThresholds':
      push = filter_openGov_referendumThresholds(...args);
      break;
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
 * matching address, chainId and balance data.
 */
const filter_account_balance_free = (
  events: EventCallback[],
  event: EventCallback
) => {
  let isUnique = true;
  const aWho = event.who.data as EventAccountData;
  const aData: { free: string } = event.data;

  for (const e of events) {
    if (e.taskAction === event.taskAction && e.data) {
      const bWho = e.who.data as EventAccountData;
      const bData: { free: string } = e.data;

      if (
        aWho.address === bWho.address &&
        aWho.chainId === bWho.chainId &&
        aData.free === bData.free
      ) {
        isUnique = false;
        break;
      }
    }
  }

  return isUnique;
};

/**
 * @name filter_account_balance_frozen
 * @summary Event is duplicate if it matches on address, chainId and frozen balance.
 */
const filter_account_balance_frozen = (
  events: EventCallback[],
  event: EventCallback
) => {
  let isUnique = true;
  const aWho = event.who.data as EventAccountData;
  const aData: { frozen: string } = event.data.frozen;

  for (const e of events) {
    if (e.taskAction === event.taskAction && e.data) {
      const bWho = e.who.data as EventAccountData;
      const bData: { frozen: string } = e.data.frozen;

      if (
        aWho.address === bWho.address &&
        aWho.chainId === bWho.chainId &&
        aData.frozen === bData.frozen
      ) {
        isUnique = false;
        break;
      }
    }
  }

  return isUnique;
};

/**
 * @name filter_account_balance_reserved
 * @summary Event is duplicate if it matches on address, chainId and frozen balance.
 */
const filter_account_balance_reserved = (
  events: EventCallback[],
  event: EventCallback
) => {
  let isUnique = true;
  const aWho = event.who.data as EventAccountData;
  const aData: { reserved: string } = event.data;

  for (const e of events) {
    if (e.taskAction === event.taskAction && e.data) {
      const bWho = e.who.data as EventAccountData;
      const bData: { reserved: string } = e.data;

      if (
        aWho.address === bWho.address &&
        aWho.chainId === bWho.chainId &&
        aData.reserved === bData.reserved
      ) {
        isUnique = false;
        break;
      }
    }
  }

  return isUnique;
};

/**
 * @name filter_account_balance_spendable
 * @summary Event is duplicate if it matches on address, chainId and spendable balance.
 */
const filter_account_balance_spendable = (
  events: EventCallback[],
  event: EventCallback
) => {
  let isUnique = true;
  const aWho = event.who.data as EventAccountData;
  const aData: { spendable: string } = event.data;

  for (const e of events) {
    if (e.taskAction === event.taskAction && e.data) {
      const bWho = e.who.data as EventAccountData;
      const bData: { spendable: string } = e.data;

      if (
        aWho.address === bWho.address &&
        aWho.chainId === bWho.chainId &&
        aData.spendable === bData.spendable
      ) {
        isUnique = false;
        break;
      }
    }
  }

  return isUnique;
};

/**
 * @name filter_nomination_pool_rewards
 * @summary The new event is considered a duplicate if another event has
 * a matching address, chainId and pending rewards balance.
 */
const filter_nomination_pool_rewards = (
  events: EventCallback[],
  event: EventCallback
) => {
  let isUnique = true;
  const aWho = event.who.data as EventAccountData;
  const aData: { pendingRewards: string } = event.data;

  for (const e of events) {
    if (e.taskAction === event.taskAction && e.data) {
      const bWho = e.who.data as EventAccountData;
      const bData: { pendingRewards: string } = e.data;

      if (
        aWho.address === bWho.address &&
        aWho.chainId === bWho.chainId &&
        aData.pendingRewards === bData.pendingRewards
      ) {
        isUnique = false;
        break;
      }
    }
  }

  // If the account has past nomination pool events, make them stale.
  // We don't want the user to try and submit out-of-date extrinsics.
  if (isUnique) {
    events = events.map((e) => {
      if (e.taskAction === event.taskAction && e.data) {
        const bWho = e.who.data as EventAccountData;
        if (aWho.address === bWho.address && aWho.chainId === bWho.chainId) {
          e.stale = true;
        }
      }
      return e;
    });
  }

  return isUnique;
};

/**
 * @name filter_nomination_pool_state
 * @summary The new event is considered a duplicate if another event has
 * a matching address, chainId and nomination pool state.
 */
const filter_nomination_pool_state = (
  events: EventCallback[],
  event: EventCallback
) => {
  let isUnique = true;
  const aWho = event.who.data as EventAccountData;
  const aData: { poolState: string } = event.data;

  for (const e of events) {
    if (e.taskAction === event.taskAction && e.data) {
      const bWho = e.who.data as EventAccountData;
      const bData: { poolState: string } = e.data;

      if (
        aWho.address === bWho.address &&
        aWho.chainId === bWho.chainId &&
        aData.poolState === bData.poolState
      ) {
        isUnique = false;
        break;
      }
    }
  }

  return isUnique;
};

/**
 * @name filter_nomination_pool_renamed
 * @summary The new event is considered a duplicate if another event has
 * a matching address, chainId and nomination pool name.
 */
const filter_nomination_pool_renamed = (
  events: EventCallback[],
  event: EventCallback
): boolean => {
  let isUnique = true;
  const aWho = event.who.data as EventAccountData;
  const aData: { poolName: string } = event.data;

  for (const e of events) {
    if (e.taskAction === event.taskAction && e.data) {
      const bWho = e.who.data as EventAccountData;
      const bData: { poolName: string } = e.data;

      if (
        aWho.address === bWho.address &&
        aWho.chainId === bWho.chainId &&
        aData.poolName === bData.poolName
      ) {
        isUnique = false;
        break;
      }
    }
  }

  return isUnique;
};

/**
 * @name filter_nomination_pool_roles
 * @summary The new event is considered a duplicate if another event has
 * a matching address, chainId and roles.
 */
const filter_nomination_pool_roles = (
  events: EventCallback[],
  event: EventCallback
): boolean => {
  let isUnique = true;
  const aWho = event.who.data as EventAccountData;
  const aData: NominationPoolRoles = event.data;

  for (const e of events) {
    if (e.taskAction === event.taskAction && e.data) {
      const bWho = e.who.data as EventAccountData;
      const bData: NominationPoolRoles = e.data;

      if (
        aWho.address === bWho.address &&
        aWho.chainId === bWho.chainId &&
        aData.depositor === bData.depositor &&
        aData.root === bData.root &&
        aData.nominator === bData.nominator &&
        aData.bouncer === bData.bouncer
      ) {
        isUnique = false;
        break;
      }
    }
  }

  return isUnique;
};

/**
 * @name filter_nomination_pool_commission
 * @summary The new event is considered a duplicate if another event has
 * a matching address, chainId and commission data.
 */
const filter_nomination_pool_commission = (
  events: EventCallback[],
  event: EventCallback
): boolean => {
  let isUnique = true;
  const aWho = event.who.data as EventAccountData;
  const aData: NominationPoolCommission = event.data;

  for (const e of events) {
    if (e.taskAction === event.taskAction && e.data) {
      const bWho = e.who.data as EventAccountData;
      const bData: NominationPoolCommission = e.data;

      if (
        aWho.address === bWho.address &&
        aWho.chainId === bWho.chainId &&
        aData.throttleFrom === bData.throttleFrom &&
        aData.max === bData.max &&
        JSON.stringify(aData.changeRate) === JSON.stringify(bData.changeRate) &&
        JSON.stringify(aData.current) === JSON.stringify(bData.current)
      ) {
        isUnique = false;
        break;
      }
    }
  }

  return isUnique;
};

/**
 * @name filter_nominating_era_rewards
 * @summary The new event is considered a duplicate if another event has
 * a matching address, chainId, pending payout and era number.
 */
const filter_nominating_era_rewards = (
  events: EventCallback[],
  event: EventCallback
): boolean => {
  let isUnique = true;
  const aWho = event.who.data as EventAccountData;
  const aData: { eraRewards: string; era: string } = event.data;

  for (const e of events) {
    if (e.taskAction === event.taskAction && e.data) {
      const bWho = e.who.data as EventAccountData;
      const bData: { eraRewards: string; era: string } = e.data;

      if (
        aWho.address === bWho.address &&
        aWho.chainId === bWho.chainId &&
        aData.era === bData.era &&
        aData.eraRewards === bData.eraRewards
      ) {
        isUnique = false;
        break;
      }
    }
  }

  return isUnique;
};

/**
 * @name filter_nominating_exposure
 * @summary The new event is considered a duplicate if another event has
 * a matching address, chainId, era number, and exposed flag.
 */
const filter_nominating_exposure = (
  events: EventCallback[],
  event: EventCallback
): boolean => {
  let isUnique = true;
  const aWho = event.who.data as EventAccountData;
  const aData: { era: number; exposed: boolean } = event.data;

  for (const e of events) {
    if (e.taskAction === event.taskAction && e.data) {
      const bWho = e.who.data as EventAccountData;
      const bData: { era: number; exposed: boolean } = e.data;

      if (
        aWho.address === bWho.address &&
        aWho.chainId === bWho.chainId &&
        aData.era === bData.era &&
        aData.exposed === bData.exposed
      ) {
        isUnique = false;
        break;
      }
    }
  }

  return isUnique;
};

/**
 * @name filter_nominating_commission
 * @summary The new event is considered a duplicate if another event has
 * a matching address, chainId, and commission data.
 */
const filter_nominating_commission = (
  events: EventCallback[],
  event: EventCallback
): boolean => {
  let isUnique = true;
  const aWho = event.who.data as EventAccountData;
  const aData: { era: number; hasChanged: boolean } = event.data;

  for (const e of events) {
    if (e.taskAction === event.taskAction && e.data) {
      const bWho = e.who.data as EventAccountData;
      const bData: { era: number; hasChanged: boolean } = e.data;

      if (
        aWho.address === bWho.address &&
        aWho.chainId === bWho.chainId &&
        aData.era === bData.era &&
        aData.hasChanged === bData.hasChanged
      ) {
        isUnique = false;
        break;
      }
    }
  }

  return isUnique;
};

/**
 * @name filter_nominating_nominations
 * @summary The new event is considered a duplicate if another event has
 * a matching address, chainId and validator data.
 */
const filter_nominating_nominations = (
  events: EventCallback[],
  event: EventCallback
): boolean => {
  let isUnique = true;
  const aWho = event.who.data as EventAccountData;
  const aData: { era: number; hasChanged: boolean } = event.data;

  for (const e of events) {
    if (e.taskAction === event.taskAction && e.data) {
      const bWho = e.who.data as EventAccountData;
      const bData: { era: number; hasChanged: boolean } = e.data;

      if (
        aWho.address === bWho.address &&
        aWho.chainId === bWho.chainId &&
        aData.era === bData.era &&
        aData.hasChanged === bData.hasChanged
      ) {
        isUnique = false;
        break;
      }
    }
  }

  return isUnique;
};

/**
 * @name filter_openGov_referendumVotes
 * @summary The new event is considered a duplicate if another event has
 * a matching action, chainId and referendum id.
 */
const filter_openGov_referendumVotes = (
  events: EventCallback[],
  event: EventCallback
): boolean => {
  let isUnique = true;

  interface Target {
    referendumId: number;
    percentAyes: string;
    percentNays: string;
  }
  const aWho = event.who.data as EventChainData;
  const aData: Target = event.data;

  for (const e of events) {
    if (e.taskAction === event.taskAction && e.data) {
      const bWho = e.who.data as EventChainData | EventAccountData;
      const bData: Target = e.data;

      if (
        aWho.chainId === bWho.chainId &&
        aData.referendumId === bData.referendumId &&
        aData.percentAyes === bData.percentAyes &&
        aData.percentNays === bData.percentNays
      ) {
        isUnique = false;
        break;
      }
    }
  }

  return isUnique;
};

/**
 * @name filter_openGov_decisionPeriod
 * @summary The new event is considered a duplicate if another event has
 * a matching action, chainId and referendum id.
 */
const filter_openGov_decisionPeriod = (
  events: EventCallback[],
  event: EventCallback
): boolean => {
  let isUnique = true;
  const aData: { referendumId: number; formattedTime: string } = event.data;
  const aWho = event.who.data as EventChainData;

  for (const e of events) {
    if (e.taskAction === event.taskAction && e.data) {
      const bWho = e.who.data as EventChainData | EventAccountData;
      const bData: { referendumId: number; formattedTime: string } = e.data;

      if (
        aWho.chainId === bWho.chainId &&
        aData.referendumId === bData.referendumId &&
        aData.formattedTime === bData.formattedTime
      ) {
        isUnique = false;
        break;
      }
    }
  }

  return isUnique;
};

/**
 * @name filter_openGov_referendumThresholds
 * @summary The new event is considered a duplicate if another event has
 * a matching action, chainId and referendum id.
 */
const filter_openGov_referendumThresholds = (
  events: EventCallback[],
  event: EventCallback
): boolean => {
  let isUnique = true;

  interface Target {
    referendumId: number;
    formattedApp: string;
    formattedSup: string;
  }
  const aData: Target = event.data;
  const aWho = event.who.data as EventChainData;

  for (const e of events) {
    if (e.taskAction === event.taskAction && e.data) {
      const bData: Target = e.data;
      const bWho = e.who.data as EventChainData | EventAccountData;

      if (
        aWho.chainId === bWho.chainId &&
        aData.referendumId === bData.referendumId &&
        aData.formattedApp === bData.formattedApp &&
        aData.formattedSup === bData.formattedSup
      ) {
        isUnique = false;
        break;
      }
    }
  }

  return isUnique;
};
