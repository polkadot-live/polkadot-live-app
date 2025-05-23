// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { APIsController } from '../../controllers/APIsController';
import { ChainList } from '@polkadot-live/consts/chains';
import {
  toU8a,
  concatU8a,
  encodeAddress,
  hexToString,
  stringToU8a,
} from '@dedot/utils';
import { bnToU8a } from '@polkadot/util';
import type {
  AccountNominationPoolData,
  NominationPoolCommission,
  NominationPoolRoles,
} from '@polkadot-live/types/accounts';
import type { Account } from '../../model';
import type { ChainID } from '@polkadot-live/types/chains';
import type { DedotClientSet } from '@polkadot-live/types/apis';

/**
 * @name getNominationPoolRewards
 * @summary Get nomination pool rewards for an address.
 *
 * @todo Decouple `APIsController`.
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
 * @name getPoolAccounts
 * @summary Generates pool stash and reward address for a pool id.
 * @param {number} poolId - id of the pool.
 */
const getPoolAccounts = (poolId: number, api: DedotClientSet) => {
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
