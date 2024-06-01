// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js';
import type { Track } from '@/model/Track';
import type { ActiveReferendaInfo } from '@/types/openGov';
import type { ApiPromise } from '@polkadot/api';

export function rmChars(str: string): string {
  // Regular expression to match commas, percentage signs, and spaces
  const regex = /[,%\s]/g;
  // Replace the matched characters with an empty string
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
    console.log(`percent`, bnPercent.toNumber());
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
