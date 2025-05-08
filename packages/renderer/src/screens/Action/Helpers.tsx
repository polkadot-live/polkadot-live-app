// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { chainCurrency, chainUnits } from '@polkadot-live/consts/chains';
import { formatDecimal } from '@core/library/TextLib';
import { ellipsisFn, planckToUnit } from '@w3ux/utils';
import {
  CopyButton,
  Identicon,
  TooltipRx,
  TriggerHeader,
  TxInfoBadge,
} from '@polkadot-live/ui/components';
import { faCoins, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { FlexRow } from '@polkadot-live/ui/styles';
import type { AnyData } from '@polkadot-live/types/misc';
import type {
  ExTransferKeepAliveData,
  ExtrinsicInfo,
} from '@polkadot-live/types/tx';

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

/**
 * @name SignerBadge
 * @summary Render signer badge for extrinsic item.
 * @deprecated
 */
export const SignerBadge = ({
  info,
  theme,
}: {
  info: ExtrinsicInfo;
  theme: AnyData;
}) => (
  <TxInfoBadge icon={faPenToSquare} label={'Signer'}>
    <FlexRow $gap={'0.6rem'}>
      <TooltipRx text={ellipsisFn(info.actionMeta.from, 12)} theme={theme}>
        <span>
          <Identicon value={info.actionMeta.from} fontSize={'1.5rem'} />
        </span>
      </TooltipRx>
      <span>{info.actionMeta.accountName}</span>
      <span>
        <CopyButton
          iconFontSize={'0.95rem'}
          theme={theme}
          onCopyClick={async () =>
            await window.myAPI.copyToClipboard(info.actionMeta.from)
          }
        />
      </span>
    </FlexRow>
  </TxInfoBadge>
);

/**
 * @name EstimatedFeeBadge
 * @summary Render an estimated fee badge for extrinsic item.
 * @deprecated
 */
export const EstimatedFeeBadge = ({
  info,
  theme,
}: {
  info: ExtrinsicInfo;
  theme: AnyData;
}) => {
  let estimatedFee = '-';
  let truncEstimatedFee = '-';

  if (info.estimatedFee) {
    const { chainId } = info.actionMeta;
    const currency = chainCurrency(chainId);
    const planck = BigInt(info.estimatedFee);
    const unit = planckToUnit(planck, chainUnits(chainId));

    estimatedFee = `${unit} ${currency}`;
    truncEstimatedFee = `${truncateDecimalPlaces(unit)} ${currency}`;
  }

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
