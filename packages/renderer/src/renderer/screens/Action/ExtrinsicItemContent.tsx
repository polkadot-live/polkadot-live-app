// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as themeVariables from '../../theme/variables';
import BigNumber from 'bignumber.js';
import { chainCurrency, chainUnits } from '@ren/config/chains';
import { ellipsisFn, planckToUnit } from '@w3ux/utils';
import {
  CopyButton,
  Identicon,
  TooltipRx,
  TxInfoBadge,
} from '@polkadot-live/ui/components';
import {
  faExclamationTriangle,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { useConnections } from '@app/contexts/common/Connections';
import { Signer } from './Signer';
import { FlexRow } from '@polkadot-live/ui/styles';
import { EstimatedFeeBadge, SignerBadge } from './Helpers';
import type { ExtrinsicItemContentProps } from './types';
import type { ExTransferKeepAliveData } from '@polkadot-live/types/tx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
          <FlexRow
            $gap={'0.75rem'}
            style={{
              marginBottom: '1rem',
              padding: '0 0.5rem',
              color: 'var(--accent-warning)',
            }}
          >
            <FontAwesomeIcon icon={faExclamationTriangle} />
            Make sure that you confirm the send amount and recipient on your
            signing device before signing the transaction.
          </FlexRow>
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
                      <Identicon value={recipientAddress} fontSize={'1.5rem'} />
                    </span>
                  </TooltipRx>
                  <span>{recipientAccountName}</span>
                  <span>
                    <CopyButton
                      iconFontSize={'0.95rem'}
                      theme={theme}
                      onCopyClick={async () =>
                        await window.myAPI.copyToClipboard(recipientAddress)
                      }
                    />
                  </span>
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
