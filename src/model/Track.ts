// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { formatDuration } from 'date-fns';
import type { AnyData } from '@/types/misc';
import type { ChainID } from '@/types/chains';
import { rmCommas } from '@w3ux/utils';

/// Utility to initialise tracks from data returned from Polkadot JS API.
/// TODO: Move to utils file.
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
      trackId
    );
  });

export const formatBlocksToTime = (chainId: ChainID, blocks: string) => {
  const secondsPerBlock =
    chainId === 'Polkadot' || chainId === 'Kusama' ? 6 : 0;

  const seconds = parseInt(rmCommas(blocks)) * secondsPerBlock;

  const days = Math.floor(seconds / (60 * 60 * 24));
  const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);

  const duration = {
    days,
    hours,
    minutes,
  };

  return formatDuration(duration);
};

/// Class to represent an Open Gov track.
export class Track {
  private _confirmPeriod: string;
  private _decisionDeposit: string;
  private _decisionPeriod: string;
  private _maxDeciding: string;
  private _minEnactmentPeriod: string;
  private _trackName: string;
  private _preparePeriod: string;
  private _trackId: number;
  private _label: string;
  // TODO: minApproval
  // TODO: minSupport

  constructor(
    confirmPeriod: string,
    decisionDeposit: string,
    decisionPeriod: string,
    maxDeciding: string,
    minEnactmentPeriod: string,
    trackName: string,
    preparePeriod: string,
    trackId: string
  ) {
    this._confirmPeriod = confirmPeriod;
    this._decisionDeposit = decisionDeposit;
    this._decisionPeriod = decisionPeriod;
    this._maxDeciding = maxDeciding;
    this._minEnactmentPeriod = minEnactmentPeriod;
    this._preparePeriod = preparePeriod;
    this._trackName = trackName;
    this._trackId = parseInt(trackId);
    this._label = Track.getReadableTrackName(this._trackId);
  }

  static getReadableTrackName = (trackId: number) => {
    switch (trackId) {
      case 0:
        return 'Root';
      case 1:
        return 'Whitelisted Caller';
      case 2:
        return 'Wish For Change';
      case 10:
        return 'Staking Admin';
      case 11:
        return 'Treasurer';
      case 12:
        return 'Lease Admin';
      case 13:
        return 'Fellowship Admin';
      case 14:
        return 'General Admin';
      case 15:
        return 'Auction Admin';
      case 20:
        return 'Referendum Canceller';
      case 21:
        return 'Referendum Killer';
      case 30:
        return 'Small Tipper';
      case 31:
        return 'Big Tipper';
      case 32:
        return 'Small Spender';
      case 33:
        return 'Medium Spender';
      case 34:
        return 'Big Spender';
      default:
        return 'Unknown Track Name';
    }
  };

  get confirmPeriod() {
    return this._confirmPeriod;
  }
  get decisionDeposit() {
    return this._decisionDeposit;
  }
  get decisionPeriod() {
    return this._decisionPeriod;
  }
  get maxDeciding() {
    return this._maxDeciding;
  }
  get minEnactmentPeriod() {
    return this._minEnactmentPeriod;
  }
  get preparePeriod() {
    return this._preparePeriod;
  }
  get trackName() {
    return this._trackName;
  }
  get trackId() {
    return this._trackId;
  }
  get label() {
    return this._label;
  }
}
