// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { HelpItemKey } from '@/renderer/contexts/common/Help/types';
import type { MinApproval, MinSupport } from '@/types/openGov';

/**
 * @name Track
 * @summary Class to represent an Open Gov track.
 */
export class Track {
  private _confirmPeriod: string;
  private _decisionDeposit: string;
  private _decisionPeriod: string;
  private _helpKey: HelpItemKey;
  private _maxDeciding: string;
  private _minEnactmentPeriod: string;
  private _trackName: string;
  private _preparePeriod: string;
  private _trackId: number;
  private _label: string;
  private _minApproval: MinApproval;
  private _minSupport: MinSupport;

  constructor(
    confirmPeriod: string,
    decisionDeposit: string,
    decisionPeriod: string,
    maxDeciding: string,
    minEnactmentPeriod: string,
    trackName: string,
    preparePeriod: string,
    trackId: string,
    minApproval: MinApproval,
    minSupport: MinSupport
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
    this._helpKey = Track.getHelpKeyWithTrackId(this._trackId);

    this._minApproval = minApproval;
    this._minSupport = minSupport;
  }

  static getHelpKeyWithTrackId = (trackId: number): HelpItemKey => {
    switch (trackId) {
      case 0:
        return 'help:openGov:origin:root';
      case 1:
        return 'help:openGov:origin:whitelistedCaller';
      case 2:
        return 'help:openGov:origin:wishForChange';
      case 10:
        return 'help:openGov:origin:stakingAdmin';
      case 11:
        return 'help:openGov:origin:treasurer';
      case 12:
        return 'help:openGov:origin:leaseAdmin';
      case 13:
        return 'help:openGov:origin:fellowshipAdmin';
      case 14:
        return 'help:openGov:origin:generalAdmin';
      case 15:
        return 'help:openGov:origin:auctionAdmin';
      case 20:
        return 'help:openGov:origin:referendumCanceller';
      case 21:
        return 'help:openGov:origin:referendumKiller';
      case 30:
        return 'help:openGov:origin:smallTipper';
      case 31:
        return 'help:openGov:origin:bigTipper';
      case 32:
        return 'help:openGov:origin:smallSpender';
      case 33:
        return 'help:openGov:origin:mediumSpender';
      case 34:
        return 'help:openGov:origin:bigSpender';
      default:
        throw new Error('Unrecognized track ID');
    }
  };

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
  get helpHey() {
    return this._helpKey;
  }
  get maxDeciding() {
    return this._maxDeciding;
  }
  get minApproval() {
    return this._minApproval;
  }
  get minSupport() {
    return this._minSupport;
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
