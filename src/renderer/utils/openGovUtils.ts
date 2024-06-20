// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js';
import { Track } from '@/model/Track';
import type { ActiveReferendaInfo } from '@/types/openGov';
import type { AnyData } from '@/types/misc';
import type { ApiPromise } from '@polkadot/api';

/**
 * @name getTracks
 * @summary Utility to initialise tracks from data returned from Polkadot JS API.
 */
export const getTracks = (data: AnyData[]) =>
  data.map((trackDataArr: AnyData) => {
    const trackId: string = trackDataArr[0];
    return new Track(
      trackDataArr[1].confirmPeriod,
      trackDataArr[1].decisionDeposit,
      trackDataArr[1].decisionPeriod,
      trackDataArr[1].maxDeciding,
      trackDataArr[1].minEnactmentPeriod,
      trackDataArr[1].name,
      trackDataArr[1].preparePeriod,
      trackId,
      trackDataArr[1].minApproval,
      trackDataArr[1].minSupport
    );
  });

/**
 * @name rmChars
 * @summary Regex to remove commas, percentage signs and spaces from string.
 */
export function rmChars(str: string): string {
  const regex = /[,%\s]/g;
  return str.replace(regex, '');
}

/**
 * @name makeReciprocalCurve
 * @summary Make reciprocal curve function.
 */
export function makeReciprocalCurve(
  factor: string,
  xOffset: string,
  yOffset: string
) {
  return function (percentage: number) {
    const bnFactor = new BigNumber(rmChars(factor));
    const bnXOffset = new BigNumber(rmChars(xOffset));
    const bnYOffset = new BigNumber(rmChars(yOffset));

    const x = percentage * Math.pow(10, 9);

    const v = bnFactor
      .div(new BigNumber(x).plus(bnXOffset))
      .multipliedBy(Math.pow(10, 9))
      .toFixed(0, BigNumber.ROUND_DOWN);

    const calcValue = new BigNumber(v)
      .plus(bnYOffset)
      .div(Math.pow(10, 9))
      .toString();

    return BigNumber.max(calcValue, 0).toString();
  };
}

/**
 * @name makeLinearCurve
 * @summary Make linear curve function.
 */
export function makeLinearCurve(length: string, floor: string, ceil: string) {
  return function (percentage: number) {
    const bnLength = new BigNumber(rmChars(length));
    const bnFloor = new BigNumber(rmChars(floor));
    const bnCeil = new BigNumber(rmChars(ceil));

    //const x = percentage * Math.pow(10, 9);
    const x = percentage * 100;

    const xValue = BigNumber.min(x, bnLength);
    const slope = new BigNumber(bnCeil).minus(bnFloor).dividedBy(bnLength);
    const deducted = slope.multipliedBy(xValue).toString();

    const perbill = new BigNumber(bnCeil)
      .minus(deducted)
      .toFixed(2, BigNumber.ROUND_DOWN);
    //.toFixed(0, BigNumber.ROUND_DOWN);

    //const calcValue = new BigNumber(perbill).div(Math.pow(10, 9)).toString();
    const calcValue = new BigNumber(perbill).div(Math.pow(10, 2)).toString();
    return BigNumber.max(calcValue, 0).toString();
  };
}

/**
 * @name getMinApprovalSupport
 * @summary Get current minimum approval and support percentages for a referendum.
 */
export const getMinApprovalSupport = async (
  api: ApiPromise,
  referendumInfo: ActiveReferendaInfo,
  track: Track
) => {
  if (!referendumInfo.Ongoing.deciding) {
    return null;
  }

  const result = { minApproval: '', minSupport: '' };

  const lastHeader = await api.rpc.chain.getHeader();
  const bnCurrentBlock = new BigNumber(lastHeader.number.toNumber());
  const bnDecisionPeriod = new BigNumber(rmChars(String(track.decisionPeriod)));

  const { since } = referendumInfo.Ongoing.deciding;
  const bnSince = new BigNumber(rmChars(String(since)));
  const bnElapsed = bnCurrentBlock.minus(bnSince);

  const bnPercent = BigNumber.min(
    bnElapsed.dividedBy(bnDecisionPeriod),
    new BigNumber(1)
  );

  // Handle min approval.
  if ('LinearDecreasing' in track.minApproval) {
    const { length, floor, ceil } = track.minApproval.LinearDecreasing;
    const curveFn = makeLinearCurve(length, floor, ceil);
    result.minApproval = curveFn(bnPercent.toNumber());
  }

  if ('Reciprocal' in track.minApproval) {
    const { factor, xOffset, yOffset } = track.minApproval.Reciprocal;
    const curveFn = makeReciprocalCurve(factor, xOffset, yOffset);
    result.minApproval = curveFn(bnPercent.toNumber());
  }

  // Handle min support.
  if ('LinearDecreasing' in track.minSupport) {
    const { length, floor, ceil } = track.minSupport.LinearDecreasing;
    const curveFn = makeLinearCurve(length, floor, ceil);
    result.minSupport = curveFn(bnPercent.toNumber());
  }

  if ('Reciprocal' in track.minSupport) {
    const { factor, xOffset, yOffset } = track.minSupport.Reciprocal;
    const curveFn = makeReciprocalCurve(factor, xOffset, yOffset);
    result.minSupport = curveFn(bnPercent.toNumber());
  }

  return result;
};

/**
 * @name renderOrigin
 * @summary Get referendum origin as string.
 */
export const renderOrigin = (referendum: ActiveReferendaInfo) => {
  const originData = referendum.Ongoing.origin;

  const origin =
    'system' in originData
      ? String(originData.system)
      : String(originData.Origins);

  return getSpacedOrigin(origin);
};

/**
 * @name getSpacedOrigin
 * @summary Get readable origin name from non-spaced string.
 */
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

/**
 * @name getOrderedOrigins
 * @summary Get referedum origins in the desired order.
 */
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

/**
 * @name getOriginIdFromName
 * @summary Get origin ID via origin.
 */
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
