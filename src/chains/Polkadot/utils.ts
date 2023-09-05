// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { bnToU8a, stringToU8a, u8aConcat } from '@polkadot/util';
import BigNumber from 'bignumber.js';
import { BN } from 'bn.js';
import { APIs } from '@/controller/APIs';

/**
 * @name getPoolAccounts
 * @summary Generates pool stash and reward address for a pool id.
 * @param {number} poolId - id of the pool.
 */
export const getPoolAccounts = (poolId: number) => {
  const { api, consts } = APIs.get('Polkadot');

  const createAccount = (pId: BigNumber, index: number): string => {
    const EmptyH256 = new Uint8Array(32);
    const ModPrefix = stringToU8a('modl');
    const U32Opts = { bitLength: 32, isLe: true };

    return api.registry
      .createType(
        'AccountId32',
        u8aConcat(
          ModPrefix,
          consts.poolsPalletId,
          new Uint8Array([index]),
          bnToU8a(new BN(pId.toString()), U32Opts),
          EmptyH256
        )
      )
      .toString();
  };

  const poolIdBigNumber = new BigNumber(poolId);
  return {
    stash: createAccount(poolIdBigNumber, 0),
    reward: createAccount(poolIdBigNumber, 1),
  };
};
