// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  ExtendedAccount,
  IMatch,
  MatchOutcome,
  MethodSubscription,
} from '@/types/blockstream';
import type { GenericEvent, GenericExtrinsic } from '@polkadot/types';

export class Match implements IMatch {
  // The name of the pallet.
  pallet: string;

  // The name of the method.
  method: string;

  constructor(i: IMatch) {
    this.pallet = i.pallet;
    this.method = i.method;
  }

  matchPallet(pallet: string): boolean {
    return this.pallet === '*' || this.pallet === pallet;
  }

  matchMethod(method: string): boolean {
    return this.method === '*' || this.method === method;
  }

  match(t: IMatch): boolean {
    return this.matchPallet(t.pallet) && this.matchMethod(t.method);
  }
}

/**
 * @name matchEventToAccount
 * @summary Match an event to an account.
 * @param event
 * @param account
 * @returns MatchOutcome
 */
export const matchEventToAccount = (
  event: GenericEvent,
  account: ExtendedAccount
): MatchOutcome => {
  if (account === 'Wildcard') {
    return true;
  } else {
    const maybeMatch = event?.data
      ?.toString()
      .includes(account.address.toString());

    if (maybeMatch) {
      return { with: account };
    } else {
      return false;
    }
  }
};

/**
 * @name matchExtrinsicToAccount
 * @summary Match an extrinsic to an account.
 * @param event
 * @param account
 * @returns MatchOutcome
 */
export const matchExtrinsicToAccount = (
  ext: GenericExtrinsic,
  account: ExtendedAccount
): MatchOutcome => {
  if (account === 'Wildcard') {
    return true;
  } else {
    // check if an extrinsic is signed by one of the active accounts.
    const maybeMatch =
      account.address.eq(ext.signer) ||
      ext?.toString().includes(account.address.toString());

    // if matched, return the account it matched with.
    if (maybeMatch) {
      return { with: account };
    } else {
      return false;
    }
  }
};

export const subscriptionFilter = (
  m: IMatch,
  sub: MethodSubscription
): boolean => {
  switch (sub.type) {
    case 'all':
      return true;
    case 'ignore':
      return !sub.ignore.find((o) => new Match(o).match(m));
    case 'only':
      return sub.only.some((o) => new Match(o).match(m));
  }
};
