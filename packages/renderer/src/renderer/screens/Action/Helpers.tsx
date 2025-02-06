// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { chainCurrency } from '@ren/config/chains';
import { ellipsisFn } from '@w3ux/utils';
import {
  Identicon,
  TooltipRx,
  TxInfoBadge,
} from '@polkadot-live/ui/components';
import { faCoins, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { FlexRow } from '@polkadot-live/ui/styles';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ExtrinsicInfo } from '@polkadot-live/types/tx';

/**
 * @name truncateDecimalPlaces
 * @summary Truncate a number represented as a string.
 */
export const truncateDecimalPlaces = (value: string, places = 4): string => {
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
 * @name SignerBadge
 * @summary Render signer badge for extrinsic item.
 */
export const SignerBadge = ({
  info,
  theme,
}: {
  info: ExtrinsicInfo;
  theme: AnyData;
}) => (
  <TxInfoBadge icon={faPenToSquare} label={'Signer'}>
    <FlexRow $gap={'0.75rem'}>
      <TooltipRx text={ellipsisFn(info.actionMeta.from, 12)} theme={theme}>
        <span>
          <Identicon value={info.actionMeta.from} size={18} />
        </span>
      </TooltipRx>
      <span>{info.actionMeta.accountName}</span>
    </FlexRow>
  </TxInfoBadge>
);

/**
 * @name EstimatedFeeBadge
 * @summary Render an estimated fee badge for extrinsic item.
 */
export const EstimatedFeeBadge = ({
  info,
  theme,
}: {
  info: ExtrinsicInfo;
  theme: AnyData;
}) => {
  const { chainId } = info.actionMeta;
  const currency = chainCurrency(chainId);

  const estimatedFee = info.estimatedFee
    ? `${info.estimatedFee} ${currency}`
    : '-';

  const truncEstimatedFee = info.estimatedFee
    ? `${truncateDecimalPlaces(info.estimatedFee)} ${currency}`
    : '-';

  return (
    <TxInfoBadge icon={faCoins} label={'Estimated Fee'}>
      <TooltipRx text={`${estimatedFee}`} theme={theme}>
        <span>{truncEstimatedFee}</span>
      </TooltipRx>
    </TxInfoBadge>
  );
};

/**
 * @name getExtrinsicDescription
 * @summary Return the extrinsic item's description.
 * @deprecated
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
