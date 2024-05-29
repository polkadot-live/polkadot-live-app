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
