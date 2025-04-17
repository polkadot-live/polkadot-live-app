// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { APIsController as DedotAPIsController } from '@ren/controller/dedot/APIsController';
import { AccountsController } from '@ren/controller/AccountsController';
import { ChainList } from '@ren/config/chains';
import { checkAddress } from '@polkadot/util-crypto';
import { getAccountNominatingData } from '@app/callbacks/nominating';
import { bnToU8a } from '@polkadot/util';
import {
  toU8a,
  concatU8a,
  encodeAddress,
  stringToU8a,
  hexToString,
} from 'dedot/utils';
import type {
  AccountBalance,
  FlattenedAccountData,
  NominationPoolCommission,
  NominationPoolRoles,
} from '@polkadot-live/types/accounts';
import type { ApiCallEntry } from '@polkadot-live/types/subscriptions';
import type { AnyData, AnyJson } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type { Account } from '@ren/model/Account';
import type { RelayDedotClient } from 'packages/types/src';

/**
 * @name getAddressChainId
 * @summary Return an address' chain ID.
 */
export const getAddressChainId = (address: string): ChainID => {
  for (const [chainId, { prefix }] of ChainList.entries()) {
    const result = checkAddress(address, prefix);

    if (result !== null) {
      const [isValid] = result;

      if (isValid) {
        return chainId;
      }
    }
  }

  throw new Error('Imported address not recognized.');
};

/**
 * @name checkValidAddress
 * @summary Verify that an address is encoded to one of the supported networks.
 */
export const checkValidAddress = (address: string): boolean => {
  for (const { prefix } of ChainList.values()) {
    const result = checkAddress(address, prefix);

    if (result !== null) {
      const [isValid] = result;

      if (isValid) {
        return true;
      }
    }
  }

  return false;
};

/**
 * @name getInitialChainAccordionValue
 * @summary Returns an initial chain ID in preferential order.
 */
export const getInitialChainAccordionValue = (chains: ChainID[]): ChainID =>
  chains.includes('Polkadot')
    ? 'Polkadot'
    : chains.includes('Kusama')
      ? 'Kusama'
      : 'Westend';

/**
 * @name generateUID
 * @summary Util for generating a UID in the browser.
 */
export const generateUID = (): string => {
  // Generate a random 16-byte array.
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);

  // Convert to a hexadecimal string.
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
};

/**
 * @name fetchAccountBalances
 * @summary Fetch account's nonce and balance data from chain state.
 */
export const fetchAccountBalances = async () => {
  for (const [chainId, accounts] of AccountsController.accounts.entries()) {
    console.log(`fetching balances for chain: ${chainId}`);
    await Promise.all(accounts.map((a) => fetchBalanceForAccount(a)));
  }
};

/**
 * @name fetchBalanceForAccount
 * @summary Fetch balance data for a single account.
 */
export const fetchBalanceForAccount = async (account: Account) => {
  if (!['Polkadot', 'Kusama', 'Westend'].includes(account.chain)) {
    return;
  }

  const api = (
    await DedotAPIsController.getConnectedApiOrThrow(account.chain)
  ).getApi();

  const result: AnyJson = await api.query.system.account(account.address);

  account.balance = {
    nonce: BigInt(result.nonce),
    free: result.data.free,
    reserved: result.data.reserved,
    frozen: result.data.frozen,
  } as AccountBalance;

  await AccountsController.set(account.chain, account);
};

/**
 * @name getBalanceForAccount
 * @summary Return an account's current balance.
 */
export const getBalanceForAccount = async (
  api: RelayDedotClient,
  address: string,
  chainId: ChainID
): Promise<AccountBalance> => {
  const result = await api.query.system.account(address);

  const balance: AccountBalance = {
    nonce: BigInt(result.nonce),
    free: result.data.free,
    reserved: result.data.reserved,
    frozen: result.data.frozen,
  };

  // Update account data if it is being managed by controller.
  const account = AccountsController.get(chainId, address);
  if (account) {
    account.balance = balance;
    await AccountsController.set(account.chain, account);
  }

  return balance;
};

/**
 * @name getSpendableBalance
 * @summary Return the requested account's spendable balance as a big number.
 */
export const getSpendableBalance = async (
  address: string,
  chainId: ChainID
): Promise<bigint> => {
  const api = (
    await DedotAPIsController.getConnectedApiOrThrow(chainId)
  ).getApi();

  // Spendable balance equation:
  // spendable = free - max(max(frozen, reserved), ed)
  const balance = await getBalanceForAccount(api, address, chainId);
  const { free, frozen, reserved } = balance;
  const ed = api.consts.balances.existentialDeposit;

  const max = (a: bigint, b: bigint): bigint => (a > b ? a : b);
  let spendable = free - max(max(frozen, reserved), ed);
  if (spendable < 0n) {
    spendable = 0n;
  }

  return spendable;
};

/**
 * @name fetchAccountNominatingData
 * @summary Fetch an account's nominated validator ids.
 */
export const fetchAccountNominatingData = async () => {
  for (const [chainId, accounts] of AccountsController.accounts.entries()) {
    console.log(`fetching nominating data for chain: ${chainId}`);
    await Promise.all(accounts.map((a) => setNominatingDataForAccount(a)));
  }
};

/**
 * @name fetchNominatingDataForAccount
 * @summary Fetch nomination pool data for a single account.
 */
export const fetchNominatingDataForAccount = async (account: Account) => {
  await setNominatingDataForAccount(account);
};

/**
 * @name setNominatingDataForAccount
 * @summary Fetch nominating data for a single account.
 */
export const setNominatingDataForAccount = async (account: Account) => {
  // Only allow nominating data on specific chains.
  if (!['Polkadot', 'Kusama', 'Westend'].includes(account.chain)) {
    return;
  }

  const api = (
    await DedotAPIsController.getConnectedApiOrThrow(account.chain)
  ).getApi();

  // Set account's nominator data.
  const maybeNominatingData = await getAccountNominatingData(api, account);
  if (maybeNominatingData) {
    account.nominatingData = { ...maybeNominatingData };
  }

  // Update account data in controller.
  await AccountsController.set(account.chain, account);
};

/**
 * @name fetchAccountNominationPoolData
 * @summary Fetch nomination pool data for all accounts managed by the accounts controller.
 */
export const fetchAccountNominationPoolData = async () => {
  for (const [chainId, accounts] of AccountsController.accounts.entries()) {
    console.log(`fetching nomination pool data for chain: ${chainId}`);
    await Promise.all(accounts.map((a) => setNominationPoolDataForAccount(a)));
  }
};

/**
 * @name fetchNominationPoolDataForAccount
 * @summary Fetch nomination pool data for a single account.
 */
export const fetchNominationPoolDataForAccount = async (account: Account) => {
  await setNominationPoolDataForAccount(account);
};

/**
 * @name getNominationPoolRewards
 * @summary Get nomination pool rewards for an arbitrary address.
 */
export const getNominationPoolRewards = async (
  address: string,
  chainId: ChainID
): Promise<bigint> => {
  const api = (
    await DedotAPIsController.getConnectedApiOrThrow(chainId)
  ).getApi();

  const result = await api.call.nominationPoolsApi.pendingRewards(address);
  return result;
};

/**
 * @name setNominationPoolDataForAccount
 * @summary Utility that uses an API instance to get and update an account's nomination
 * pool data.
 */
const setNominationPoolDataForAccount = async (account: Account) => {
  if (!['Polkadot', 'Kusama', 'Westend'].includes(account.chain)) {
    return;
  }

  const api = (
    await DedotAPIsController.getConnectedApiOrThrow(account.chain)
  ).getApi();

  // Return early if account is not currently in a nomination pool.
  const result = await api.query.nominationPools.poolMembers(account.address);
  if (!result) {
    return;
  }

  // Get pool ID and reward address.
  const { poolId } = result;
  const { reward: poolRewardAddress } = getPoolAccounts(poolId, api);

  // Get pending rewards for the account.
  const poolPendingRewards = (
    await api.call.nominationPoolsApi.pendingRewards(account.address)
  ).toString();

  // Get nomination pool data.
  const npResult = await api.query.nominationPools.bondedPools(poolId);
  if (!npResult) {
    return;
  }

  const poolState: string = npResult.state;
  const { depositor, root, nominator, bouncer } = npResult.roles;
  const { changeRate, current, max, throttleFrom } = npResult.commission;

  const poolRoles: NominationPoolRoles = {
    depositor: depositor.raw,
    root: root?.raw || undefined,
    nominator: nominator?.raw || undefined,
    bouncer: bouncer?.raw || undefined,
  };

  const poolCommission: NominationPoolCommission = {
    current: current ? [current[0].toString(), current[1].raw] : undefined,
    max: max ? max.toString() : undefined,
    changeRate: changeRate
      ? {
          maxIncrease: changeRate.maxIncrease.toString(),
          minDelay: changeRate.minDelay.toString(),
        }
      : undefined,
    throttleFrom: throttleFrom ? throttleFrom.toString() : undefined,
  };

  // Get nomination pool name.
  const poolMeta = await api.query.nominationPools.metadata(poolId);
  const poolName: string = hexToString(poolMeta);

  if (poolRewardAddress) {
    // Add nomination pool data to account.
    account.nominationPoolData = {
      poolId,
      poolRewardAddress,
      poolPendingRewards,
      poolState,
      poolName,
      poolRoles,
      poolCommission,
    };

    // Store updated account data in controller.
    await AccountsController.set(account.chain, account);
  }
};

/**
 * @name getPoolAccounts
 * @summary Generates pool stash and reward address for a pool id.
 * @param {number} poolId - id of the pool.
 */
const getPoolAccounts = (poolId: number, api: RelayDedotClient) => {
  const createAccount = (pId: bigint, index: number): string => {
    const poolsPalletId = api.consts.nominationPools.palletId;

    const key = concatU8a(
      stringToU8a('modl'),
      toU8a(poolsPalletId),
      new Uint8Array([index]),
      bnToU8a(BigInt(poolId.toString())),
      new Uint8Array(32)
    );

    const prefix = api.consts.system.ss58Prefix;
    return encodeAddress(key.slice(0, 32), prefix);
  };

  const poolIdBigInt = BigInt(poolId);

  return {
    stash: createAccount(poolIdBigInt, 0),
    reward: createAccount(poolIdBigInt, 1),
  };
};

/**
 * @name getNonceForAddress
 * @summary Get the live nonce for an address.
 */
export const getAddressNonce = async (
  api: RelayDedotClient,
  address: string
): Promise<number> => (await api.query.system.account(address)).nonce;

/**
 * @name checkAccountWithProperties
 * @summary Check if account data exists with an API call entry, and if
 * the associated account, along with the passed dynamic properties, also
 * exist. Callbacks will exit early if this function fails.
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
  const {
    chainId,
    account: { address },
  } = entry.task;
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

export const checkFlattenedAccountWithProperties = (
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

  // Iterate properties and return false if any are undefined or null.
  for (const key of properties) {
    const result = getProperty(entry.task.account, key);

    if (result === null || result === undefined) {
      throw new Error('checkFlattenedAccountWithProperties: Data not found');
    }
  }

  // Otherwise, return the account.
  return entry.task.account;
};

/**
 * @name formatPerbill Converts a Perbill value into a percentage string with fixed decimal places.
 * @param perbill - A bigint or number representing a Perbill (0 to 1_000_000_000).
 * @param decimals - Number of decimal places to display (default: 2).
 * @returns A string like "12.34%"
 */
export const formatPerbillPercent = (
  perbill: bigint | number,
  decimals = 2
): string => {
  const BILLION = 1_000_000_000n;
  const value = typeof perbill === 'number' ? BigInt(perbill) : perbill;

  if (value < 0n || value > BILLION) {
    throw new Error('Perbill must be between 0 and 1_000_000_000');
  }

  const percentage = (value * 10n ** BigInt(decimals + 2)) / BILLION; // scale to get decimal percentage
  const integerPart = percentage / 10n ** BigInt(decimals);
  const fractionPart = percentage % 10n ** BigInt(decimals);

  return `${integerPart}.${fractionPart.toString().padStart(decimals, '0')}%`;
};
