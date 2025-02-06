// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as themeVariables from '../../theme/variables';
import { chainCurrency, chainUnits } from '@ren/config/chains';
import type {
  ExTransferKeepAliveData,
  ExtrinsicInfo,
} from '@polkadot-live/types/tx';
import BigNumber from 'bignumber.js';
import { ellipsisFn, planckToUnit } from '@w3ux/utils';
import {
  Identicon,
  TooltipRx,
  TxInfoBadge,
} from '@polkadot-live/ui/components';
import {
  faCoins,
  faPenToSquare,
  faUser,
} from '@fortawesome/free-solid-svg-icons';

// TMP
import { useConnections } from '@app/contexts/common/Connections';
import { Signer } from './Signer';
import { FlexRow } from '@polkadot-live/ui/styles';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ExtrinsicItemContentProps } from './types';

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
const SignerBadge = ({
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
const EstimatedFeeBadge = ({
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
 * @name ExtrinsicItemContent
 * @summary Return the extrinsic item's content.
 */
export const ExtrinsicItemContent = ({
  info,
}: ExtrinsicItemContentProps): React.ReactNode => {
  const { isBuildingExtrinsic, darkMode } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;
  const { chainId, data: serData } = info.actionMeta;

  switch (info.actionMeta.action) {
    case 'balances_transferKeepAlive': {
      const {
        sendAmount: planck,
        recipientAccountName,
        recipientAddress,
      }: ExTransferKeepAliveData = JSON.parse(serData);

      const units = chainUnits(chainId);
      const bnPlanck = new BigNumber(planck);
      const bnUnit = planckToUnit(bnPlanck, units);
      const currency = chainCurrency(chainId);
      const fmtAmount = <b>{`${bnUnit.toString()} ${currency}`}</b>;

      return (
        <>
          <p>
            Transfer {fmtAmount} to account {recipientAccountName}.
          </p>
          <FlexRow $gap={'1rem'}>
            <FlexRow $gap={'1rem'} style={{ flex: 1 }}>
              {/* Signing Account */}
              <SignerBadge info={info} theme={theme} />
              {/* Recipient */}
              <TxInfoBadge icon={faUser} label={'Recipient'}>
                <FlexRow $gap={'0.75rem'}>
                  <TooltipRx
                    text={ellipsisFn(recipientAddress, 12)}
                    theme={theme}
                  >
                    <span>
                      <Identicon value={recipientAddress} size={18} />
                    </span>
                  </TooltipRx>
                  <span>{recipientAccountName}</span>
                </FlexRow>
              </TxInfoBadge>
              {/* Estimated Fee */}
              <EstimatedFeeBadge info={info} theme={theme} />
            </FlexRow>

            {/* Signer */}
            <Signer
              info={info}
              valid={!isBuildingExtrinsic && info.estimatedFee !== undefined}
            />
          </FlexRow>
        </>
      );
    }
    case 'nominationPools_pendingRewards_bond': {
      const bnPendingRewardsPlanck = new BigNumber(serData.extra);
      const bnUnit = planckToUnit(bnPendingRewardsPlanck, chainUnits(chainId));
      const fmtAmount = (
        <b>{`${bnUnit.toString()} ${chainCurrency(chainId)}`}</b>
      );

      return (
        <>
          <p>Compound {fmtAmount}.</p>
          <FlexRow $gap={'1rem'}>
            <FlexRow $gap={'1rem'} style={{ flex: 1 }}>
              {/* Signing Account */}
              <SignerBadge info={info} theme={theme} />
              {/* Estimated Fee */}
              <EstimatedFeeBadge info={info} theme={theme} />
            </FlexRow>

            {/* Signer */}
            <Signer
              info={info}
              valid={!isBuildingExtrinsic && info.estimatedFee !== undefined}
            />
          </FlexRow>
        </>
      );
    }
    case 'nominationPools_pendingRewards_withdraw': {
      const bnPendingRewardsPlanck = new BigNumber(serData.extra);
      const bnUnit = planckToUnit(bnPendingRewardsPlanck, chainUnits(chainId));
      const fmtAmount = (
        <b>{`${bnUnit.toString()} ${chainCurrency(chainId)}`}</b>
      );

      return (
        <>
          <p>Claim {fmtAmount}.</p>
          <FlexRow $gap={'1rem'}>
            <FlexRow $gap={'1rem'} style={{ flex: 1 }}>
              {/* Signing Account */}
              <SignerBadge info={info} theme={theme} />
              {/* Estimated Fee */}
              <EstimatedFeeBadge info={info} theme={theme} />
            </FlexRow>

            {/* Signer */}
            <Signer
              info={info}
              valid={!isBuildingExtrinsic && info.estimatedFee !== undefined}
            />
          </FlexRow>
        </>
      );
    }
  }
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
