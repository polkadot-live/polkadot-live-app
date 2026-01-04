// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { chainCurrency, chainUnits } from '@polkadot-live/consts/chains';
import { formatDecimal } from '@polkadot-live/core';
import { ellipsisFn, planckToUnit } from '@w3ux/utils';
import { TriggerHeader } from '@polkadot-live/ui';
import type {
  ExTransferKeepAliveData,
  ExtrinsicInfo,
} from '@polkadot-live/types/tx';

/**
 * @name truncateDecimalPlaces
 * @summary Truncate a number represented as a string.
 */
export const truncateDecimalPlaces = (value: string, places = 6): string => {
  const decimalIndex = value.indexOf('.');
  return value.indexOf('.') === -1 || value.length - decimalIndex - 1 <= places
    ? value
    : value.slice(0, decimalIndex + (places + 1));
};

/**
 * @name getExtrinsicTitle
 * @summary Return the extrinsic item's title.
 */
export const getExtrinsicTitle = (info: ExtrinsicInfo) => {
  const { action } = info.actionMeta;
  const MAXLEN = 7;

  switch (action) {
    case 'balances_transferKeepAlive': {
      const { chainId, data } = info.actionMeta;
      const { sendAmount }: ExTransferKeepAliveData = data;
      const planck = BigInt(sendAmount);
      const unit = formatDecimal(planckToUnit(planck, chainUnits(chainId)));

      const fmtAmount =
        unit.length > MAXLEN ? ellipsisFn(unit, MAXLEN, 'end') : unit;

      return (
        <TriggerHeader>
          Transfer
          <span>
            {fmtAmount} {chainCurrency(chainId)}
          </span>
        </TriggerHeader>
      );
    }
    case 'nominationPools_pendingRewards_withdraw':
    case 'nominationPools_pendingRewards_bond': {
      const { chainId, data } = info.actionMeta;
      const rewards = BigInt(data.extra);
      const unit = planckToUnit(rewards, chainUnits(chainId));

      const fmtAmount =
        unit.length > MAXLEN ? ellipsisFn(unit, MAXLEN, 'end') : unit;

      const title =
        action === 'nominationPools_pendingRewards_bond'
          ? 'Compound Rewards'
          : 'Claim Rewards';

      return (
        <TriggerHeader>
          {title}
          <span>
            {fmtAmount} {chainCurrency(chainId)}
          </span>
        </TriggerHeader>
      );
    }
  }
};
