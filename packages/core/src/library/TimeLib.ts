// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { formatDuration } from 'date-fns';
import { rmCommas } from '@w3ux/utils';
import type { ChainID } from '@polkadot-live/types/chains';

/**
 * @name secondsUntilNextMinute
 * @summary Returns seconds until next multiple of the passed minute with the system clock.
 */
export const secondsUntilNextMinute = (minute: number): number => {
  const now = new Date();
  const currentMinutes = now.getMinutes();
  const currentSeconds = now.getSeconds();

  // Calculate minutes until next 15-minute mark
  const minutesPastQuarter = currentMinutes % minute;
  const minutesUntilNextQuarter = minute - minutesPastQuarter;

  // If we are exactly at a quarter, the next quarter is in 15 minutes
  const totalMinutesUntilNextQuarter =
    minutesPastQuarter === 0 ? minute : minutesUntilNextQuarter;

  // Calculate the total seconds until the next quarter
  const secondsUntilNextQuarter =
    totalMinutesUntilNextQuarter * 60 - currentSeconds;

  return secondsUntilNextQuarter;
};

/**
 * @name formatBlocksToTime
 * @summary Takes a number of blocks and returns a readable duration.
 */
export const formatBlocksToTime = (chainId: ChainID, blocks: string) => {
  const secondsPerBlock =
    chainId === 'Polkadot Relay' || chainId === 'Kusama Relay' ? 6 : 0;

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
