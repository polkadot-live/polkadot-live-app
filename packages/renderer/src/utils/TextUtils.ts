// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { chainCurrency, chainUnits } from '@ren/config/chains';
import { formatDistanceToNow } from 'date-fns';
import { planckToUnit, rmCommas } from '@w3ux/utils';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  NominationPoolCommission,
  NominationPoolRoles,
} from '@polkadot-live/types/accounts';
import { formatPerbillPercent } from './AccountUtils';

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
 * @name truncateDecimals
 * @summary Truncate decimal string to decimal places.
 */
export const truncateDecimals = (value: string, decimals: number): string => {
  const [intPart, decimalPart] = value.split('.');
  return !decimalPart
    ? intPart
    : `${intPart}.${decimalPart.slice(0, decimals)}`;
};

/**
 * @name formatDecimal
 * @summary Format a decimal number represented as a string.
 */
export const formatDecimal = (value: string): string => {
  const [intPart, decimalPart = ''] = value.split('.');

  if (decimalPart.length === 0) {
    return `${intPart}.00`;
  }

  // Remove trailing zeros
  const trimmed = decimalPart.replace(/0+$/, '');

  // Ensure at least 2 digits
  const padded = trimmed.padEnd(2, '0');

  return `${intPart}.${padded}`;
};

/**
 * @name formatChainUnits
 * @summary Get readable chain units for rendering.
 */
export const formatChainUnits = (units: string, chainId: ChainID) => {
  // Include regex to remove trailing zeros after decimal point.
  const asUnit: string = planckToUnit(
    BigInt(rmCommas(units)),
    chainUnits(chainId)
  );

  const formatted: string = truncateDecimals(asUnit, 2)
    .replace(/(\.\d*?[1-9])0+|\.0*$/, '$1')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return `${formatted} ${chainCurrency(chainId)}`;
};

/**
 * @name getBalanceText
 * @summary Text to render for transfer events.
 */
export const getBalanceText = (
  balance: bigint | string,
  chainId: ChainID
): string => {
  const asUnit = planckToUnit(balance, chainUnits(chainId));
  const regexA = /\.0+$/; // Remove trailing zeros after a decimal point.
  const regexB = /\B(?=(\d{3})+(?!\d))/g; // Insert commas as thousand separators.
  const formatted: string = truncateDecimals(asUnit, 3)
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
) => {
  const hasCommission = cur.current !== undefined;
  const fmtCommission = hasCommission
    ? formatPerbillPercent(BigInt(cur.current![0]))
    : 'not set';

  // TODO: Improve text message.
  return JSON.stringify(cur.changeRate) === JSON.stringify(prev.changeRate) &&
    JSON.stringify(cur.current) === JSON.stringify(prev.current) &&
    cur.throttleFrom === prev.throttleFrom &&
    cur.max === prev.max
    ? `Pool commission is ${fmtCommission}.`
    : `Pool commission set to ${fmtCommission}.`;
};
