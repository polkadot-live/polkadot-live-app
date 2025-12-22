// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccountsController } from '../../controllers/AccountsController';
import { decodeAddress } from 'dedot/utils';
import type { Account } from '../../model';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ApiCallEntry } from '@polkadot-live/types/subscriptions';
import type { ChainID } from '@polkadot-live/types/chains';
import type { FlattenedAccountData } from '@polkadot-live/types/accounts';

/**
 * @name isValidAddress
 * @summary Return whether an address is valid Substrate address.
 */
export const isValidAddress = (address: string, prefix?: number): boolean => {
  try {
    prefix ? decodeAddress(address, undefined, prefix) : decodeAddress(address);
    return true;
  } catch {
    return false;
  }
};

/**
 * @name checkAccountWithProperties
 * @summary Check if account data exists with an API call entry, and if
 * the associated account, along with the passed dynamic properties, also
 * exist. Callbacks will exit early if this function fails.
 *
 * @todo Decouple from `AccountsController`.
 */
export const checkAccountWithProperties = (
  entry: ApiCallEntry,
  properties: (keyof Account)[]
): Account => {
  // Check for account existence and fetch it.
  if (!entry.task.account) {
    throw new Error('checkAccountWithProperties: Account not found');
  }

  // eslint-disable-next-line prettier/prettier
  const { chainId, account: { address } } = entry.task;
  const account = AccountsController.get(chainId, address);

  if (account === undefined) {
    throw new Error('checkAccountWithProperties: Account not found');
  }

  // Utility to access an instance property dynamically.
  const getProperty = (instance: Account, key: keyof Account): AnyData => {
    switch (key) {
      case 'balance': {
        return instance.balance;
      }
      case 'nominatingData': {
        return instance.nominatingData;
      }
      case 'nominationPoolData':
        return instance.nominationPoolData;
      default:
        return null;
    }
  };

  // Iterate properties and return false if any are undefined or null.
  for (const key of properties) {
    const result = getProperty(account, key);
    if (result === null || result === undefined) {
      throw new Error('checkAccountWithProperties: Account data not found');
    }
  }

  // Otherwise, return the account.
  return account;
};

/**
 * @name checkFlattenedAccountWithProperties
 * @summary Checks account data to determine its staking status.
 */
export const checkFlattenedAccountProperties = (
  entry: ApiCallEntry,
  properties: (keyof FlattenedAccountData)[]
) => {
  // Check for account existence.
  if (!entry.task.account) {
    throw new Error('checkFlattenedAccountWithProperties: Account not found');
  }

  // Utility to access an instance property dynamically.
  const getProperty = (
    instance: FlattenedAccountData,
    key: keyof FlattenedAccountData
  ): AnyData => {
    switch (key) {
      case 'nominationPoolData':
        return instance.nominationPoolData;
      default:
        return null;
    }
  };

  const { chainId } = entry.task;
  const { address } = entry.task.account;
  const account = AccountsController.get(chainId, address);
  if (!account) {
    throw new Error('checkFlattenedAccountProperties: Account not found');
  }

  // Iterate properties and return false if any are undefined or null.
  const flattened = account.flatten();
  for (const key of properties) {
    const result = getProperty(flattened, key);
    if (result === null || result === undefined) {
      throw new Error('checkFlattenedAccountWithProperties: Data not found');
    }
  }

  // Otherwise, return the account.
  return flattened;
};

/**
 * @name getFlattenedAccount
 * @summary Retrieves account data in a flattened format from the accounts controller.
 */
export const getFlattenedAccount = (
  address: string,
  chainId: ChainID
): FlattenedAccountData => {
  const account = AccountsController.get(chainId, address);
  if (!account) {
    throw new Error('getFlattenedAccount: Account not found');
  }
  return account.flatten();
};
