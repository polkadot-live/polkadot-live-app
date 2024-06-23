// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { hexToU8a, isHex } from '@polkadot/util';
import type { MutableRefObject } from 'react';

/**
 * @name setStateWithRef
 * @summary Synchronize React state and its reference with the provided value.
 */
export const setStateWithRef = <T>(
  value: T,
  setState: (_state: T) => void,
  ref: MutableRefObject<T>
): void => {
  setState(value);
  ref.current = value;
};

/**
 * @name planckToUnit
 * @summary convert planck to the token unit.
 * @description
 * Converts an on chain balance value in BigNumber planck to a decimal value in token unit. (1 token
 * = 10^units planck).
 */
export const planckToUnit = (val: BigNumber, units: number) =>
  new BigNumber(
    val.dividedBy(new BigNumber(10).exponentiatedBy(units)).toFixed(units)
  );

/**
 * @name rmCommas
 * @summary Removes the commas from a string.
 */
export const rmCommas = (val: string): string => val.replace(/,/g, '');

/**
 * @name appendOrEmpty
 * @summary Returns ` value` if a condition is truthy, or an empty string otherwise.
 */
export const appendOrEmpty = (
  condition: boolean | string | undefined,
  value: string
) => (condition ? ` ${value}` : '');

/**
 * @name appendOr
 * @summary Returns ` value` if condition is truthy, or ` fallback` otherwise.
 */
export const appendOr = (
  condition: boolean | string | undefined,
  value: string,
  fallback: string
) => (condition ? ` ${value}` : ` ${fallback}`);

/**
 * @name unescape
 * @summary Replaces \” with “
 */
export const unescape = (val: string) => val.replace(/\\"/g, '"');

/**
 * @name ellipsisFn
 * @summary Receives an address and creates ellipsis on the given string, based on parameters.
 * @param str  - The string to apply the ellipsis on
 * @param amount  - The amount of characters that the ellipsis will be
 * @param position - where the ellipsis will apply; if center the amount of character is the
 * same for beginning and end; if "start" or "end" then its only once the amount; defaults to "start"
 */
export const ellipsisFn = (
  str: string,
  amount = 6,
  position: 'start' | 'end' | 'center' = 'center'
) => {
  const half = str.length / 2;

  // having an amount less than 4 is a bit extreme so we default there
  if (amount <= 4) {
    if (position === 'center') {
      return str.slice(0, 4) + '...' + str.slice(-4);
    }
    if (position === 'end') {
      return str.slice(0, 4) + '...';
    }
    return '...' + str.slice(-4);
  }
  // if the amount requested is in a "logical" amount - meaning that it can display the address
  // without repeating the same information twice - then go for it;
  if (position === 'center') {
    return amount >= (str.length - 2) / 2
      ? str.slice(0, half - 3) + '...' + str.slice(-(half - 3))
      : str.slice(0, amount) + '...' + str.slice(-amount);
  }
  // else, the user has been mistaskenly extreme, so just show the maximum possible amount
  if (amount >= str.length) {
    if (position === 'end') {
      return str.slice(0, str.length - 3) + '...';
    }
    return '...' + str.slice(-(str.length - 3));
  } else {
    if (position === 'end') {
      return str.slice(0, amount) + '...';
    }
    return '...' + str.slice(amount);
  }
};

/**
 * @name isValidHttpUrl
 * @summary Give a string, return whether it is a valid http URL.
 * @param string  - The string to check.
 */
export const isValidHttpUrl = (string: string) => {
  let url: URL;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
};

/**
 * @name isValidAddress
 * @summary Return whether an address is valid Substrate address.
 */
export const isValidAddress = (address: string) => {
  try {
    encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address));
    return true;
  } catch (e) {
    return false;
  }
};
