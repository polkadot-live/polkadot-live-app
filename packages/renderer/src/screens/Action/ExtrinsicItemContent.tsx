// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as FA from '@fortawesome/free-solid-svg-icons';
import { chainCurrency, chainUnits } from '@polkadot-live/consts/chains';
import { formatDecimal } from '@polkadot-live/core';
import { planckToUnit } from '@w3ux/utils';
import { useConnections } from '@ren/contexts/common';
import { Signer } from './Signer';
import { FlexRow, ResponsiveRow } from '@polkadot-live/styles/wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ExtrinsicItemContentWrapper } from './Wrappers';
import type { ExtrinsicItemContentProps } from './types';
import type { ExTransferKeepAliveData } from '@polkadot-live/types/tx';

/**
 * @name ExtrinsicItemContent
 * @summary Return the extrinsic item's content.
 */
export const ExtrinsicItemContent = ({
  info,
  onClickSummary,
}: ExtrinsicItemContentProps): React.ReactNode => {
  const { chainId, data } = info.actionMeta;
  const { cacheGet } = useConnections();
  const isBuildingExtrinsic = cacheGet('extrinsic:building');

  const renderSummaryButton = () => (
    <button className="SummaryButton" onClick={() => onClickSummary()}>
      <FlexRow $gap={'0.5rem'}>
        <FontAwesomeIcon icon={FA.faTableList} transform={'shrink-2'} />
        <span>Summary</span>
      </FlexRow>
    </button>
  );

  switch (info.actionMeta.action) {
    case 'balances_transferKeepAlive': {
      const {
        sendAmount: planck,
        recipientAccountName,
      }: ExTransferKeepAliveData = data;

      const units = chainUnits(chainId);
      const biPlanck = BigInt(planck);
      const unit = formatDecimal(planckToUnit(biPlanck, units));
      const currency = chainCurrency(chainId);
      const fmtAmount = <b>{`${unit} ${currency}`}</b>;

      return (
        <ExtrinsicItemContentWrapper>
          <div className="WarningBox">
            <FlexRow $gap={'0.6rem'}>
              <FontAwesomeIcon icon={FA.faExclamationTriangle} />
              <span>
                Review the send amount and recipient on your device before
                signing.
              </span>
            </FlexRow>
          </div>

          <ResponsiveRow $smGap="1.25rem" $smWidth="600px">
            <p style={{ flex: 1 }}>
              Transfer {fmtAmount} to account <b>{recipientAccountName}</b>.
            </p>

            <FlexRow>
              {renderSummaryButton()}
              <Signer
                info={info}
                valid={!isBuildingExtrinsic && info.estimatedFee !== undefined}
              />
            </FlexRow>
          </ResponsiveRow>
        </ExtrinsicItemContentWrapper>
      );
    }
    case 'nominationPools_pendingRewards_bond': {
      const rewards = BigInt(data.extra);
      const unit = planckToUnit(rewards, chainUnits(chainId));
      const fmtAmount = <b>{`${unit} ${chainCurrency(chainId)}`}</b>;

      return (
        <ExtrinsicItemContentWrapper>
          <ResponsiveRow $smGap="1.25rem" $smWidth="600px">
            <p style={{ flex: 1 }}>Compound {fmtAmount}.</p>

            <FlexRow>
              {renderSummaryButton()}
              <Signer
                info={info}
                valid={!isBuildingExtrinsic && info.estimatedFee !== undefined}
              />
            </FlexRow>
          </ResponsiveRow>
        </ExtrinsicItemContentWrapper>
      );
    }
    case 'nominationPools_pendingRewards_withdraw': {
      const rewards = BigInt(data.extra);
      const unit = planckToUnit(rewards, chainUnits(chainId));
      const fmtAmount = <b>{`${unit} ${chainCurrency(chainId)}`}</b>;

      return (
        <ExtrinsicItemContentWrapper>
          <ResponsiveRow $smGap="1.25rem" $smWidth="600px">
            <p style={{ flex: 1 }}>Claim {fmtAmount}.</p>

            <FlexRow>
              {renderSummaryButton()}
              <Signer
                info={info}
                valid={!isBuildingExtrinsic && info.estimatedFee !== undefined}
              />
            </FlexRow>
          </ResponsiveRow>
        </ExtrinsicItemContentWrapper>
      );
    }
  }
};
