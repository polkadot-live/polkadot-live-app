// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { chainCurrency, chainUnits } from '@/config/chains';
import { formatDistanceToNow } from 'date-fns';
import { planckToUnit } from '@w3ux/utils';
import type BigNumber from 'bignumber.js';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  NominationPoolCommission,
  NominationPoolRoles,
} from '@polkadot-live/types/accounts';

/**
 * @name timestampToDate
 * @summary Format a timestamp into a date to render on an event item.
 */
export const timestampToDate = (timestamp: number): string => {
  // Convert timestamp to milliseconds
  const milliseconds = timestamp * 1000;

  // Create a new Date object
  const date = new Date(milliseconds);

  // Get day, month, and year
  const day = date.getDate();
  const month = date.getMonth() + 1; // Note: Months are zero-based
  const year = date.getFullYear();

  // Format day, month, and year as DD/MM/YYYY
  const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;

  return formattedDate;
};

/**
 * @name renderTimeAgo
 * @summary Render "time ago" on a received timestamp using date-fns.
 */
export const renderTimeAgo = (timestamp: number): string => {
  const distance = formatDistanceToNow(timestamp * 1000, {
    includeSeconds: true,
  });
  return `${distance} ago`;
};

/**
 * @name getNominationPoolRolesText
 * @summary Text to render for nomination pool roles events.
 */
export const getNominationPoolRolesText = (
  curState: NominationPoolRoles,
  prevState: NominationPoolRoles
): string => {
  // Add changed roles to an array.
  const changedRoles: string[] = [];

  for (const key in curState) {
    const k = key as keyof NominationPoolRoles;
    if (curState[k] !== prevState[k]) {
      changedRoles.push(key);
    }
  }

  // Compute the subtitle depending on if roles have changed.
  const text =
    changedRoles.length === 0
      ? 'Roles remain unchanged.'
      : changedRoles.reduce(
          (acc, r) => (acc === '' ? `${acc} ${r}` : `${acc} + ${r}`),
          ''
        ) + ' changed.';

  return text;
};

/**
 * @name getNominationPoolRenamedText
 * @summary Text to render for nomination pool rename events.
 */
export const getNominationPoolRenamedText = (
  curName: string,
  prevName: string
): string =>
  curName !== prevName
    ? `Changed from ${prevName} to ${curName}`
    : `${curName}`;

/**
 * @name getNominationPoolStateText
 * @summary Text to render for nomination state events.
 */
export const getNominationPoolStateText = (
  curState: string,
  prevState: string
): string =>
  curState !== prevState
    ? `Changed from ${prevState} to ${curState}.`
    : `Current state is ${curState}.`;

/**
 * @name getBalanceText
 * @summary Text to render for transfer events.
 */
export const getBalanceText = (
  balance: BigNumber,
  chainId: ChainID
): string => {
  const asUnit = planckToUnit(balance as BigNumber, chainUnits(chainId));
  const regexA = /\.0+$/; // Remove trailing zeros after a decimal point.
  const regexB = /\B(?=(\d{3})+(?!\d))/g; // Insert commas as thousand separators.

  const formatted: string = asUnit
    .toFixed(3)
    .replace(regexA, '')
    .replace(regexB, ',');

  return `${formatted} ${chainCurrency(chainId)}`;
};

/**
 * @name getNominationPoolCommissionText
 * @summary Text to render for nomination pool commission events.
 */
export const getNominationPoolCommissionText = (
  cur: NominationPoolCommission,
  prev: NominationPoolCommission
) =>
  // TODO: Improve text message.
  JSON.stringify(cur.changeRate) === JSON.stringify(prev.changeRate) &&
  JSON.stringify(cur.current) === JSON.stringify(prev.current) &&
  cur.throttleFrom === prev.throttleFrom &&
  cur.max === prev.max
    ? `Pool commission is ${cur.current}.`
    : `Pool commission set to ${cur.current}.`;
