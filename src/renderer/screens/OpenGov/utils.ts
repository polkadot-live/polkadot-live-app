// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ActiveReferendaInfo } from '@/types/openGov';

/// Get referedum origins in the desired order.
export const getOrderedOrigins = () => [
  'Root',
  'WhitelistedCaller',
  'WishForChange',
  'StakingAdmin',
  'Treasurer',
  'LeaseAdmin',
  'FellowshipAdmin',
  'GeneralAdmin',
  'AuctionAdmin',
  'ReferendumCanceller',
  'ReferendumKiller',
  'SmallTipper',
  'BigTipper',
  'SmallSpender',
  'MediumSpender',
  'BigSpender',
];

/// Get referendum origin as string.
export const renderOrigin = (referendum: ActiveReferendaInfo) => {
  const originData = referendum.Ongoing.origin;

  const origin =
    'system' in originData
      ? String(originData.system)
      : String(originData.Origins);

  return getSpacedOrigin(origin);
};

/// Get origin ID via origin.
export const getOriginIdFromName = (origin: string): number => {
  switch (origin) {
    case 'Root':
      return 0;
    case 'WhitelistedCaller':
      return 1;
    case 'WishForChange':
      return 2;
    case 'StakingAdmin':
      return 10;
    case 'Treasurer':
      return 11;
    case 'LeaseAdmin':
      return 12;
    case 'FellowshipAdmin':
      return 13;
    case 'GeneralAdmin':
      return 14;
    case 'AuctionAdmin':
      return 15;
    case 'ReferendumCanceller':
      return 20;
    case 'ReferendumKiller':
      return 21;
    case 'SmallTipper':
      return 30;
    case 'BigTipper':
      return 31;
    case 'SmallSpender':
      return 32;
    case 'MediumSpender':
      return 33;
    case 'BigSpender':
      return 32;
    default:
      return 0;
  }
};

export const getSpacedOrigin = (origin: string) => {
  switch (origin) {
    case 'Root':
      return 'Root';
    case 'WhitelistedCaller':
      return 'Whitelisted Caller';
    case 'WishForChange':
      return 'Wish For Change';
    case 'StakingAdmin':
      return 'Staking Admin';
    case 'Treasurer':
      return 'Treasurer';
    case 'LeaseAdmin':
      return 'Lease Admin';
    case 'FellowshipAdmin':
      return 'Fellowship Admin';
    case 'GeneralAdmin':
      return 'General Admin';
    case 'AuctionAdmin':
      return 'Auction Admin';
    case 'ReferendumCanceller':
      return 'Referendum Canceller';
    case 'ReferendumKiller':
      return 'Referendum Killer';
    case 'SmallTipper':
      return 'Small Tipper';
    case 'BigTipper':
      return 'Big Tipper';
    case 'SmallSpender':
      return 'Small Spender';
    case 'MediumSpender':
      return 'Medium Spender';
    case 'BigSpender':
      return 'Big Spender';
    default:
      return origin;
  }
};
