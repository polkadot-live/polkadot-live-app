// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js';
import { Track } from '@ren/model/Track';
import type {
  RefDeciding,
  ReferendaInfo,
  ReferendumStatus,
  RefOngoing,
  RefStatus,
  SerializedPalletReferendaCurve,
  SerializedTrackItem,
} from '@polkadot-live/types/openGov';
import type { PalletReferendaTrack } from '@dedot/chaintypes/westend';
import type { RelayDedotClient } from '@polkadot-live/types/apis';
import type {
  PalletReferendaCurve,
  PalletReferendaTrackInfo,
} from '@dedot/chaintypes/substrate';

/**
 * @name serializeCurve
 * @summary Serialize referenda curve data based on its type.
 */
const serializeCurve = (curve: PalletReferendaCurve) => {
  switch (curve.type) {
    case 'Reciprocal':
      return {
        ...curve,
        value: {
          factor: curve.value.factor.toString(),
          xOffset: curve.value.xOffset.toString(),
          yOffset: curve.value.yOffset.toString(),
        },
      };
    case 'LinearDecreasing':
      return {
        ...curve,
        value: {
          length: curve.value.length.toString(),
          floor: curve.value.floor.toString(),
          ceil: curve.value.ceil.toString(),
        },
      };
    case 'SteppedDecreasing':
      return {
        ...curve,
        value: {
          begin: curve.value.begin.toString(),
          end: curve.value.end.toString(),
          step: curve.value.step.toString(),
          period: curve.value.period.toString(),
        },
      };
  }
};

/**
 * @name parseCurve
 * @summary Parse serialized referenda curve data based on its type.
 */
const parseCurve = (
  curve: SerializedPalletReferendaCurve
): PalletReferendaCurve => {
  switch (curve.type) {
    case 'LinearDecreasing': {
      return {
        type: 'LinearDecreasing',
        value: {
          length: Number(curve.value.length),
          floor: Number(curve.value.floor),
          ceil: Number(curve.value.ceil),
        },
      } as PalletReferendaCurve;
    }
    case 'Reciprocal': {
      return {
        type: 'Reciprocal',
        value: {
          factor: BigInt(curve.value.factor),
          xOffset: BigInt(curve.value.xOffset),
          yOffset: BigInt(curve.value.yOffset),
        },
      } as PalletReferendaCurve;
    }
    default: {
      return {
        type: 'SteppedDecreasing',
        value: {
          begin: Number(curve.value.begin),
          end: Number(curve.value.end),
          step: Number(curve.value.step),
          period: Number(curve.value.period),
        },
      } as PalletReferendaCurve;
    }
  }
};

/**
 * @name serializeTracks
 * @summary Serialize tracks for transmission.
 */
export const getSerializedTracks = (
  tracks: PalletReferendaTrack[] | [number, PalletReferendaTrackInfo][]
) =>
  tracks.map((item) => {
    const legacy = Array.isArray(item);
    const info = legacy ? item[1] : item.info;

    return {
      id: legacy ? item[0].toString() : item.id.toString(),
      info: {
        name: info.name,
        maxDeciding: info.maxDeciding.toString(),
        decisionDeposit: info.decisionDeposit.toString(),
        preparePeriod: info.preparePeriod.toString(),
        decisionPeriod: info.decisionPeriod.toString(),
        confirmPeriod: info.confirmPeriod.toString(),
        minEnactmentPeriod: info.minEnactmentPeriod.toString(),
        minApproval: serializeCurve(info.minApproval),
        minSupport: serializeCurve(info.minSupport),
      },
    } as SerializedTrackItem;
  });

/**
 * @name getTracks
 * @summary Utility to initialise tracks from data returned from Polkadot JS API.
 */
export const getTracks = (serialized: SerializedTrackItem[]) =>
  serialized.map(
    (item) =>
      new Track(
        item.info.confirmPeriod,
        item.info.decisionDeposit,
        item.info.decisionPeriod,
        item.info.maxDeciding,
        item.info.minEnactmentPeriod,
        item.info.name,
        item.info.preparePeriod,
        item.id,
        parseCurve(item.info.minApproval),
        parseCurve(item.info.minSupport)
      )
  );

/**
 * @name serializeReferendumInfo
 * @summary Serialize referendum info data.
 */
export const serializeReferendumInfo = (
  refStatus: ReferendumStatus
): RefOngoing => {
  const {
    alarm,
    deciding,
    decisionDeposit,
    enactment,
    inQueue,
    origin,
    proposal,
    submissionDeposit,
    submitted,
    tally,
    track,
  } = refStatus;

  return {
    alarm: alarm
      ? [alarm[0].toString(), [alarm[1][0].toString(), alarm[1][0].toString()]]
      : null,
    deciding: deciding
      ? {
          confirming: deciding.confirming
            ? deciding.confirming.toString()
            : null,
          since: deciding.since.toString(),
        }
      : null,
    decisionDeposit: decisionDeposit
      ? {
          who: String(decisionDeposit.who),
          amount: decisionDeposit.amount.toString(),
        }
      : null,
    enactment: {
      type: enactment.type,
      value: enactment.value.toString(),
    },
    inQueue,
    origin:
      origin.type === 'System'
        ? String(origin.value.type)
        : origin.type === 'Origins'
          ? String(origin.value)
          : 'Unknown',
    proposal:
      proposal.type === 'Legacy'
        ? {
            type: 'Legacy',
            value: { hash: proposal.value.hash.toString() },
          }
        : proposal.type === 'Inline'
          ? { type: 'Inline', value: proposal.value.toString() }
          : {
              type: 'Lookup',
              value: {
                hash: proposal.value.hash.toString(),
                len: proposal.value.len.toString(),
              },
            },
    submissionDeposit: {
      who: String(submissionDeposit.who),
      amount: submissionDeposit.amount.toString(),
    },
    submitted: submitted.toString(),
    tally: {
      ayes: tally.ayes.toString(),
      nays: tally.nays.toString(),
      support: tally.support.toString(),
    },
    track: track.toString(),
  };
};

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
    const bnFactor = new BigNumber(factor);
    const bnXOffset = new BigNumber(xOffset);
    const bnYOffset = new BigNumber(yOffset);

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
export function makeLinearCurve(length: number, floor: number, ceil: number) {
  return function (percentage: number) {
    const bnLength = new BigNumber(length);
    const bnFloor = new BigNumber(floor);
    const bnCeil = new BigNumber(ceil);

    const x = percentage * Math.pow(10, 9);
    //const x = percentage * 100;

    const xValue = BigNumber.min(x, bnLength);
    const slope = new BigNumber(bnCeil).minus(bnFloor).dividedBy(bnLength);
    const deducted = slope.multipliedBy(xValue).toString();

    const perbill = new BigNumber(bnCeil)
      .minus(deducted)
      .toFixed(0, BigNumber.ROUND_DOWN);
    //.toFixed(2, BigNumber.ROUND_DOWN);

    const calcValue = new BigNumber(perbill).div(Math.pow(10, 9)).toString();
    //const calcValue = new BigNumber(perbill).div(Math.pow(10, 2)).toString();
    return BigNumber.max(calcValue, 0).toString();
  };
}

/**
 * @name getMinApprovalSupport
 * @summary Get current minimum approval and support percentages for a referendum.
 */
export const getMinApprovalSupport = async (
  api: RelayDedotClient,
  referendumInfo: ReferendaInfo,
  track: Track
) => {
  // Confirm referendum status is valid.
  if (
    !(['Deciding', 'Confirming'] as RefStatus[]).includes(
      referendumInfo.refStatus
    )
  ) {
    return null;
  }

  const info = referendumInfo.info as RefDeciding;
  if (!info.deciding) {
    return null;
  }

  const result = { minApproval: '', minSupport: '' };

  const lastHeader = await api.rpc.chain_getHeader();
  const bnCurrentBlock = new BigNumber(lastHeader!.number);
  const bnDecisionPeriod = new BigNumber(rmChars(String(track.decisionPeriod)));

  const { since } = info.deciding;
  const bnSince = new BigNumber(rmChars(String(since)));
  const bnElapsed = bnCurrentBlock.minus(bnSince);

  const bnPercent = BigNumber.min(
    bnElapsed.dividedBy(bnDecisionPeriod),
    new BigNumber(1)
  );

  // Handle min approval.
  if (track.minApproval.type === 'LinearDecreasing') {
    const { length, floor, ceil } = track.minApproval.value;
    const curveFn = makeLinearCurve(length, floor, ceil);
    result.minApproval = curveFn(bnPercent.toNumber());
  }

  if (track.minApproval.type === 'Reciprocal') {
    const { factor, xOffset, yOffset } = track.minApproval.value;
    const curveFn = makeReciprocalCurve(
      factor.toString(),
      xOffset.toString(),
      yOffset.toString()
    );
    result.minApproval = curveFn(bnPercent.toNumber());
  }

  // Handle min support.
  if (track.minSupport.type === 'LinearDecreasing') {
    const { length, floor, ceil } = track.minSupport.value;
    const curveFn = makeLinearCurve(length, floor, ceil);
    result.minSupport = curveFn(bnPercent.toNumber());
  }

  if (track.minSupport.type === 'Reciprocal') {
    const { factor, xOffset, yOffset } = track.minSupport.value;
    const curveFn = makeReciprocalCurve(
      factor.toString(),
      xOffset.toString(),
      yOffset.toString()
    );
    result.minSupport = curveFn(bnPercent.toNumber());
  }

  return result;
};

/**
 * @name renderOrigin
 * @summary Get referendum origin as string.
 */
export const renderOrigin = (referendum: ReferendaInfo) => {
  if (
    !(
      ['Queueing', 'Preparing', 'Confirming', 'Deciding'] as RefStatus[]
    ).includes(referendum.refStatus)
  ) {
    return 'Unknown';
  }

  const origin = (referendum.info as RefDeciding).origin;
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
