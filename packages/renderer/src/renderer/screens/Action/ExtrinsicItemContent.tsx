// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as FA from '@fortawesome/free-solid-svg-icons';
import BigNumber from 'bignumber.js';
import { chainCurrency, chainUnits } from '@ren/config/chains';
import { planckToUnit } from '@w3ux/utils';
import { useConnections } from '@app/contexts/common/Connections';
import { Signer } from './Signer';
import { FlexRow, ResponsiveRow } from '@polkadot-live/ui/styles';
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
  setDialogInfo,
  setDialogOpen,
}: ExtrinsicItemContentProps): React.ReactNode => {
  const { isBuildingExtrinsic } = useConnections();
  const { chainId, data } = info.actionMeta;

  const onClickSummary = () => {
    setDialogInfo(info);
    setDialogOpen(true);
  };

  switch (info.actionMeta.action) {
    case 'balances_transferKeepAlive': {
      const {
        sendAmount: planck,
        recipientAccountName,
      }: ExTransferKeepAliveData = data;

      const units = chainUnits(chainId);
      const bnPlanck = new BigNumber(planck);
      const bnUnit = planckToUnit(bnPlanck, units);
      const currency = chainCurrency(chainId);
      const fmtAmount = <b>{`${bnUnit.toString()} ${currency}`}</b>;

      return (
        <ExtrinsicItemContentWrapper>
          <div className="WarningBox">
            <FlexRow $gap={'0.75rem'}>
              <FontAwesomeIcon icon={FA.faExclamationTriangle} />
              <span>
                Make sure that you confirm the send amount and recipient on your
                signing device before signing the transaction.
              </span>
            </FlexRow>
          </div>

          <ResponsiveRow $smGap="1.25rem" $smWidth="600px">
            <p style={{ flex: 1 }}>
              Transfer {fmtAmount} to account <b>{recipientAccountName}</b>.
            </p>

            <FlexRow>
              <button
                className="SummaryButton"
                onClick={() => onClickSummary()}
              >
                <FlexRow $gap={'0.5rem'}>
                  <FontAwesomeIcon
                    icon={FA.faTableList}
                    transform={'shrink-2'}
                  />
                  <span>Summary</span>
                </FlexRow>
              </button>
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
      const bnPendingRewardsPlanck = new BigNumber(data.extra);
      const bnUnit = planckToUnit(bnPendingRewardsPlanck, chainUnits(chainId));
      const fmtAmount = (
        <b>{`${bnUnit.toString()} ${chainCurrency(chainId)}`}</b>
      );

      return (
        <ExtrinsicItemContentWrapper>
          <ResponsiveRow $smGap="1.25rem" $smWidth="600px">
            <p style={{ flex: 1 }}>Compound {fmtAmount}.</p>

            <FlexRow>
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
      const bnPendingRewardsPlanck = new BigNumber(data.extra);
      const bnUnit = planckToUnit(bnPendingRewardsPlanck, chainUnits(chainId));
      const fmtAmount = (
        <b>{`${bnUnit.toString()} ${chainCurrency(chainId)}`}</b>
      );

      return (
        <ExtrinsicItemContentWrapper>
          <ResponsiveRow $smGap="1.25rem" $smWidth="600px">
            <p style={{ flex: 1 }}>Claim {fmtAmount}.</p>

            <FlexRow>
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
