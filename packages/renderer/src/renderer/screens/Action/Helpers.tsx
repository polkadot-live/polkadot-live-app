// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { chainCurrency, chainUnits } from '@ren/config/chains';
import type {
  ExTransferKeepAliveData,
  ExtrinsicInfo,
} from '@polkadot-live/types/tx';
import BigNumber from 'bignumber.js';
import { planckToUnit } from '@w3ux/utils';

/**
 * @name getExtrinsicTitle
 * @summary Return the extrinsic item's title.
 */
export const getExtrinsicTitle = (info: ExtrinsicInfo) => {
  switch (info.actionMeta.action) {
    case 'balances_transferKeepAlive': {
      return 'Transfer';
    }
    case 'nominationPools_pendingRewards_bond': {
      return 'Compound Rewards';
    }
    case 'nominationPools_pendingRewards_withdraw': {
      return 'Claim Rewards';
    }
  }
};

/**
 * @name getExtrinsicSubtitle
 * @summary Return the extrinsic item's subtitle.
 */

export const getExtrinsicSubtitle = (info: ExtrinsicInfo): React.ReactNode => {
  const { chainId, data: serData } = info.actionMeta;
  switch (info.actionMeta.action) {
    case 'balances_transferKeepAlive': {
      const {
        sendAmount: planck,
        recipientAccountName,
      }: ExTransferKeepAliveData = JSON.parse(serData);

      const units = chainUnits(chainId);
      const bnPlanck = new BigNumber(planck);
      const bnUnit = planckToUnit(bnPlanck, units);

      return (
        <p>
          Transfer{' '}
          <b>
            {bnUnit.toString()} {chainCurrency(chainId)}
          </b>{' '}
          to account <b>{recipientAccountName}</b>.
        </p>
      );
    }
    case 'nominationPools_pendingRewards_bond': {
      return (
        <p>
          Compound{' '}
          <b>
            {serData.extra} {chainCurrency(chainId)}
          </b>
          .
        </p>
      );
    }
    case 'nominationPools_pendingRewards_withdraw': {
      return (
        <p>
          Claim{' '}
          <b>
            {serData.extra} {chainCurrency(chainId)}
          </b>
          .
        </p>
      );
    }
  }
};

/**
 * @name getExtrinsicDescription
 * @summary Return the extrinsic item's description.
 */
export const getExtrinsicDescription = (info: ExtrinsicInfo) => {
  switch (info.actionMeta.action) {
    case 'balances_transferKeepAlive': {
      return "Transfer the chain's native token to a recipient address.";
    }
    case 'nominationPools_pendingRewards_bond': {
      return 'Once submitted, your rewards will be bonded back into the pool. You own these additional bonded funds and will be able to withdraw them at any time';
    }
    case 'nominationPools_pendingRewards_withdraw': {
      return 'Withdrawing rewards will immediately transfer them to your account as free balance.';
    }
  }
};
