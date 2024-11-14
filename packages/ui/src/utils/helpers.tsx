// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js';
import { chainCurrency, chainUnits } from '@ren/config/chains';
import { planckToUnit, rmCommas } from '@w3ux/utils';
import { LoadingPlaceholderWrapper } from '../styles/LoadingPlaceholderWrapper';
import type { ChainID } from '@polkadot-live/types/chains';

/**
 * @name createArrayWithLength
 * @summary Utility for creating an array of `n` length.
 */
export const createArrayWithLength = (n: number): number[] =>
  [...Array(n + 1)].map((_, i) => i);

/**
 * @name formatChainUnits
 * @summary Get readable chain units for rendering.
 */
export const formatChainUnits = (units: string, chainId: ChainID) => {
  // Include regex to remove trailing zeros after decimal point.
  const formatted: string = planckToUnit(
    new BigNumber(rmCommas(units)),
    chainUnits(chainId)
  )
    .toFixed(2)
    .replace(/(\.\d*?[1-9])0+|\.0*$/, '$1')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return `${formatted} ${chainCurrency(chainId)}`;
};

/**
 * @name renderPlaceholders
 * @summary Render placeholder loaders.
 */
export const renderPlaceholders = (
  length: number,
  height = '3rem',
  borderRadius = '1.25rem'
) => (
  <LoadingPlaceholderWrapper $height={height} $borderRadius={borderRadius}>
    <div className="placeholder-content-wrapper">
      {createArrayWithLength(length).map((_, i) => (
        <div key={i} className="placeholder-content"></div>
      ))}
    </div>
  </LoadingPlaceholderWrapper>
);

/**
 * @name validateAccountName
 * @summary Validate an account name received from user input.
 */

export const validateAccountName = (accountName: string): boolean => {
  // Regulare expression for allowed characters in the account name (including spaces).
  const regex = /^[a-zA-Z0-9._-\s]+$/;

  // Check if the length of the nickname is between 3 and 30 characters.
  if (accountName.length < 3 || accountName.length > 20) {
    return false;
  }

  // Check if the account name contains only allowed characters.
  if (!regex.test(accountName)) {
    return false;
  }

  return true;
};
