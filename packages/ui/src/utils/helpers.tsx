// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { LoadingPlaceholderWrapper } from '../styles/LoadingPlaceholderWrapper';

/**
 * @name createArrayWithLength
 * @summary Utility for creating an array of `n` length.
 */
export const createArrayWithLength = (n: number): number[] =>
  [...Array(n + 1)].map((_, i) => i);

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
