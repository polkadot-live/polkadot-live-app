// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { APIsController } from '@ren/controller/dedot/APIsController';
import { AccountsController } from '@ren/controller/AccountsController';
import { ChainList } from '@polkadot-live/consts/chains';
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
  AccountNominationPoolData,
  FlattenedAccountData,
  NominationPoolCommission,
  NominationPoolRoles,
} from '@polkadot-live/types/accounts';
import type {
  ApiCallEntry,
  PostCallbackFlags,
} from '@polkadot-live/types/subscriptions';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type { Account } from '@ren/model/Account';
import type { RelayDedotClient } from '@polkadot-live/types/apis';

/**
 * @name getPostCallbackFlags
 * @summary Get reset post callback sync flags.
 */
export const getPostCallbackFlags = (): PostCallbackFlags => ({
  syncAccountBalance: false,
  syncAccountNominating: false,
  syncAccountNominationPool: false,
});

/**
 * @name processOneShotPostCallback
 * @summary Update managed account data after a one-shot callback if necessary.
 */
export const processOneShotPostCallback = async (
  api: RelayDedotClient,
  account: Account,
  syncFlags: PostCallbackFlags
) => {
  // Sync account balance.
  if (syncFlags.syncAccountBalance) {
    const { address, chain } = account;
    const balance = await getBalance(api, address, chain, false);
    account.balance = balance;
  }

  // Sync account nominating data.
  if (syncFlags.syncAccountNominating) {
    const result = await getAccountNominatingData(api, account);
    result && (account.nominatingData = result);
  }

  // Sync account nomination pool data.
  if (syncFlags.syncAccountNominationPool) {
    const result = await getNominationPoolData(account);
    result && (account.nominationPoolData = result);
  }

  // Update managed account data.
  await AccountsController.set(account.chain, account);

  // Reset flags.
  syncFlags = {
    syncAccountBalance: false,
    syncAccountNominating: false,
    syncAccountNominationPool: false,
  };
};

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
 * @name setAccountBalances
 * @summary Set nonce and balance data for managed accounts.
 */
export const setAccountBalances = async () => {
  for (const [chainId, accounts] of AccountsController.accounts.entries()) {
    console.log(`fetching balances for chain: ${chainId}`);
    await Promise.all(accounts.map((a) => setBalance(a)));
  }
};

/**
 * @name setBalance
 * @summary Set balance data for a single account.
 */
export const setBalance = async (account: Account) => {
  if (!Array.from(ChainList.keys()).includes(account.chain)) {
    return;
  }

  const api = (
    await APIsController.getConnectedApiOrThrow(account.chain)
  ).getApi();

  const result = await api.query.system.account(account.address);

  account.balance = {
    nonce: BigInt(result.nonce),
    free: result.data.free,
    reserved: result.data.reserved,
    frozen: result.data.frozen,
  } as AccountBalance;

  await AccountsController.set(account.chain, account);
};

/**
 * @name getBalance
 * @summary Return an account's current balance.
 */
export const getBalance = async (
  api: RelayDedotClient,
  address: string,
  chainId: ChainID,
  syncAccount = true
): Promise<AccountBalance> => {
  const result = await api.query.system.account(address);

  const balance: AccountBalance = {
    nonce: BigInt(result.nonce),
    free: result.data.free,
    reserved: result.data.reserved,
    frozen: result.data.frozen,
  };

  // Update account data if it is being managed by controller.
  if (syncAccount) {
    const account = AccountsController.get(chainId, address);
    if (account) {
      account.balance = balance;
      await AccountsController.set(account.chain, account);
    }
  }

  return balance;
};

/**
 * @name getSpendableBalance
 * @summary Return an account's spendable balance as a big number.
 */
export const getSpendableBalance = async (
  address: string,
  chainId: ChainID
): Promise<bigint> => {
  const api = (await APIsController.getConnectedApiOrThrow(chainId)).getApi();
  const ed = api.consts.balances.existentialDeposit;
  const balance = await getBalance(api, address, chainId);
  const { free, frozen, reserved } = balance;
  const max = (a: bigint, b: bigint): bigint => (a > b ? a : b);

  return chainId == 'Westend'
    ? free - ed
    : max(free - max(frozen, reserved) - ed, 0n);
};

/**
 * @name setAccountsNominatingData
 * @summary Set nominating data for managed accounts.
 */
export const setAccountsNominatingData = async () => {
  for (const [chainId, accounts] of AccountsController.accounts.entries()) {
    console.log(`fetching nominating data for chain: ${chainId}`);
    await Promise.all(accounts.map((a) => setNominatingData(a)));
  }
};

/**
 * @name setNominatingData
 * @summary Set nominating data for a single account.
 */
export const setNominatingData = async (account: Account) => {
  try {
    // Only allow nominating data on specific chains.
    if (!Array.from(ChainList.keys()).includes(account.chain)) {
      return;
    }

    const api = (
      await APIsController.getConnectedApiOrThrow(account.chain)
    ).getApi();

    // Set account's nominator data.
    const maybeNominatingData = await getAccountNominatingData(api, account);
    account.nominatingData = maybeNominatingData
      ? { ...maybeNominatingData }
      : null;

    // Update account data in controller.
    await AccountsController.set(account.chain, account);
  } catch (err) {
    console.error(err);
  }
};

/**
 * @name setAccountsNominationPoolData
 * @summary Set nomination pool data for managed accounts.
 */
export const setAccountsNominationPoolData = async () => {
  for (const [chainId, accounts] of AccountsController.accounts.entries()) {
    console.log(`fetching nomination pool data for chain: ${chainId}`);
    await Promise.all(
      accounts.map(async (a) => {
        const result = await getNominationPoolData(a);
        if (result) {
          a.nominationPoolData = result;
          await AccountsController.set(a.chain, a);
        }
      })
    );
  }
};

/**
 * @name setNominationPoolData
 * @summary Set nomination pool data for a single account.
 */
export const setNominationPoolData = async (account: Account) => {
  const result = await getNominationPoolData(account);
  if (result) {
    account.nominationPoolData = result;
    await AccountsController.set(account.chain, account);
  }
};

/**
 * @name getNominationPoolRewards
 * @summary Get nomination pool rewards for an address.
 */
export const getNominationPoolRewards = async (
  address: string,
  chainId: ChainID
): Promise<bigint> => {
  const api = (await APIsController.getConnectedApiOrThrow(chainId)).getApi();
  const result = await api.call.nominationPoolsApi.pendingRewards(address);
  return result;
};

/**
 * @name getNominationPoolData
 * @summary Get an account's nomination pool data.
 */
export const getNominationPoolData = async (
  account: Account
): Promise<AccountNominationPoolData | null> => {
  if (!Array.from(ChainList.keys()).includes(account.chain)) {
    return null;
  }

  const api = (
    await APIsController.getConnectedApiOrThrow(account.chain)
  ).getApi();

  // Return early if account is not currently in a nomination pool.
  const result = await api.query.nominationPools.poolMembers(account.address);
  if (!result) {
    return null;
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
    return null;
  }

  const poolState: string = npResult.state;
  const { depositor, root, nominator, bouncer } = npResult.roles;
  const { changeRate, current, max, throttleFrom } = npResult.commission;

  const prefix = api.consts.system.ss58Prefix;
  const poolRoles: NominationPoolRoles = {
    depositor: depositor.address(prefix),
    root: root ? root.address(prefix) : undefined,
    nominator: nominator ? nominator.address(prefix) : undefined,
    bouncer: bouncer ? bouncer.address(prefix) : undefined,
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

  // Add nomination pool data to account.
  return {
    poolId,
    poolRewardAddress,
    poolPendingRewards,
    poolState,
    poolName,
    poolRoles,
    poolCommission,
  };
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
 * @name getAddressNonce
 * @summary Get the current nonce for an address.
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
 * @name perbillToPercent Converts a Perbill value into a percentage string with fixed decimal places.
 * @param perbill - A bigint or number representing a Perbill (0 to 1_000_000_000).
 * @param decimals - Number of decimal places to display (default: 2).
 * @returns A string like "12.34%"
 */
export const perbillToPercent = (
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
