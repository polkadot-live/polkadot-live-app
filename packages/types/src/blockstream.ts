// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

//import type { GenericEvent, GenericExtrinsic } from '@polkadot/types';
//import type { Address } from '@polkadot/types/interfaces/runtime';

// An account can either be a concrete account (a @polkadot `Address`) or a wildcard.
export type ExtendedAccount = ConcreteAccount | 'Wildcard';

// A raw account to input to `BlockStream` and config
export interface RawAccount {
  address: string;
  nickname: string;
  config: MethodSubscription;
}

// An Actual account with nickname and config.
export interface ConcreteAccount {
  //address: Address;
  nickname: string;
  config: MethodSubscription;
}

// A record of a delegator and its assigned delegate with callback of interest.
export interface SubscriptionDelegate {
  address: string;
  delegate: {
    // TODO: this should be an array of delegates.
    address: string;
    match: {
      pallet: string;
      method: string;
    };
    callback: string;
  };
}

// The types of subscriptions that are available.
export type MethodSubscription = All | Only | Ignore;

// A BlockStream config.
export interface BlockStreamConfig {
  accounts: RawAccount[];
  apiSubscription: ApiSubscription;
}

// The types of API subscription to use. `Head` is much quicker than `Finalized`, but `Head` events
// are not guaranteed to be finalised.
export enum ApiSubscription {
  Head = 'head',
  Finalized = 'finalized',
}

// Whether the notification is coming from an event or an extrinsic (pallet.method).
export type NotificationReportType = 'event' | 'extrinsic';

// A generic notification that can be either an event or an extrinsic.
export interface GenericNotification {
  type: NotificationReportType;
  //data: GenericExtrinsic | GenericEvent;
}

// Subscribe only to the selected account events.
export interface Only {
  type: 'only';
  only: IMatch[];
}

// Subscribe to all the selected account events apart from the ones specified.
export interface Ignore {
  type: 'ignore';
  ignore: IMatch[];
}

// Subscribe to all of the selected account's events.
export interface All {
  type: 'all';
}

// A subscription target is a pallet and method that is being subscribed to.
export interface IMatch {
  pallet: string;
  method: string;
}

// The accounts to which an event has matched.
interface Matched {
  with: ExtendedAccount;
}

/// The outcome of a matching:
///
/// `false`, if this is not a match.
/// `true`, if this is a wildcard match.
/// `Matched`, if this matched against a specific account.
export type MatchOutcome = false | Matched | true;
