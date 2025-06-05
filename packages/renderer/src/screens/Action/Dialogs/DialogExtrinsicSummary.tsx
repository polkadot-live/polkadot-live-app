// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Dialog from '@radix-ui/react-dialog';
import * as Styles from '@polkadot-live/ui/styles';

import { chainCurrency, chainUnits } from '@polkadot-live/consts/chains';
import { formatDecimal } from '@polkadot-live/core';
import { useConnections } from '@ren/contexts/common';
import { Cross2Icon } from '@radix-ui/react-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTableList } from '@fortawesome/free-solid-svg-icons';
import { ellipsisFn, planckToUnit } from '@w3ux/utils';
import { CopyButton, Identicon, TooltipRx } from '@polkadot-live/ui/components';
import { truncateDecimalPlaces } from '../Helpers';
import { InfoPanel } from './Wrappers';
import type { ExTransferKeepAliveData } from '@polkadot-live/types/tx';
import type { DialogExtrinsicSummaryProps } from './types';

export const DialogExtrinsicSummary = ({
  info,
  dialogOpen,
  setDialogOpen,
  renderTrigger = true,
}: DialogExtrinsicSummaryProps) => {
  const { getTheme } = useConnections();
  const theme = getTheme();

  /**
   * Utils.
   */
  const renderAccountItem = (address: string, accountName: string) => (
    <div className="RightItem">
      <TooltipRx text={ellipsisFn(address, 12)} theme={theme}>
        <span>
          <Identicon value={address} fontSize="1.5rem" />
        </span>
      </TooltipRx>
      <span>{accountName}</span>
      <span>
        <CopyButton
          iconFontSize={'0.95rem'}
          theme={theme}
          onCopyClick={async () => await window.myAPI.copyToClipboard(address)}
        />
      </span>
    </div>
  );

  const renderEstimatedFee = () => {
    if (!info || !info.estimatedFee) {
      return (
        <span className="RightItem">
          <TooltipRx text={''} theme={theme}>
            <span>-</span>
          </TooltipRx>
        </span>
      );
    }

    const { chainId } = info.actionMeta;
    const currency = chainCurrency(chainId);
    const planck = BigInt(info.estimatedFee!);
    const unit = planckToUnit(planck, chainUnits(chainId));

    return (
      <span className="RightItem">
        <TooltipRx text={`${unit} ${currency}`} theme={theme}>
          <span>{`${truncateDecimalPlaces(unit)} ${currency}`}</span>
        </TooltipRx>
      </span>
    );
  };

  /**
   * Renders specific summary information based on the extrinsic type.
   */
  const renderSummaryForTx = () => {
    if (!info) {
      return;
    }

    const { chainId, data } = info.actionMeta;

    switch (info.actionMeta.action) {
      case 'balances_transferKeepAlive': {
        const {
          sendAmount,
          recipientAccountName,
          recipientAddress,
        }: ExTransferKeepAliveData = data;

        const units = chainUnits(chainId);
        const planck = BigInt(sendAmount);
        const unit = formatDecimal(planckToUnit(planck, units));
        const currency = chainCurrency(chainId);

        return (
          <>
            {/** Receiver */}
            <InfoPanel $theme={theme}>
              <div>
                <span className="LeftItem">Recipient</span>
                {renderAccountItem(recipientAddress, recipientAccountName)}
              </div>
            </InfoPanel>

            {/** Send Amount */}
            <InfoPanel $theme={theme}>
              <div>
                <span className="LeftItem">Send Amount</span>
                <span className="RightItem">{`${unit} ${currency}`}</span>
              </div>
            </InfoPanel>
          </>
        );
      }
      case 'nominationPools_pendingRewards_bond':
      case 'nominationPools_pendingRewards_withdraw': {
        const rewards = BigInt(data.extra);
        const unit = planckToUnit(rewards, chainUnits(chainId));

        const title =
          info.actionMeta.action === 'nominationPools_pendingRewards_bond'
            ? 'Compound Amount'
            : 'Withdraw Amount';

        /** Compount Amount */
        return (
          <InfoPanel $theme={theme}>
            <div>
              <span className="LeftItem">{title}</span>
              <span className="RightItem">
                <TooltipRx
                  text={`${unit} ${chainCurrency(chainId)}`}
                  theme={theme}
                >
                  <span>{`${truncateDecimalPlaces(unit)} ${chainCurrency(chainId)}`}</span>
                </TooltipRx>
              </span>
            </div>
          </InfoPanel>
        );
      }
    }
  };

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
      {renderTrigger && (
        <Styles.DialogTrigger $theme={theme}>
          <div className="Dialog__GenericButton">
            <Styles.FlexRow $gap={'0.5rem'}>
              <FontAwesomeIcon icon={faTableList} transform={'shrink-1'} />
              <span>Summary</span>
            </Styles.FlexRow>
          </div>
        </Styles.DialogTrigger>
      )}
      <Dialog.Portal>
        <Dialog.Overlay className="Dialog__Overlay" />

        <Styles.DialogContent $theme={theme}>
          <Dialog.Close className="Dialog__IconButton">
            <Cross2Icon />
          </Dialog.Close>
          <Styles.FlexColumn $rowGap={'1.5rem'}>
            <Styles.FlexColumn $rowGap={'0.75rem'}>
              <Dialog.Title className="Dialog__Title">
                Transaction Summary
              </Dialog.Title>

              <Dialog.Description className="Dialog__Description">
                Review the complete transaction summary below.
              </Dialog.Description>
            </Styles.FlexColumn>

            <Styles.FlexColumn $rowGap={'2px'}>
              {/** Network */}
              <InfoPanel $theme={theme}>
                <div>
                  <span className="LeftItem">Network</span>
                  <span className="RightItem">
                    {info ? info.actionMeta.chainId : '-'}
                  </span>
                </div>
              </InfoPanel>

              {/** Pallet */}
              <InfoPanel $theme={theme}>
                <div>
                  <span className="LeftItem">Pallet</span>
                  <span className="RightItem">
                    {info ? info.actionMeta.pallet : '-'}
                  </span>
                </div>
              </InfoPanel>

              {/** Method */}
              <InfoPanel $theme={theme}>
                <div>
                  <span className="LeftItem">Method</span>
                  <span className="RightItem">
                    {info ? info.actionMeta.method : '-'}
                  </span>
                </div>
              </InfoPanel>

              {/** Sender */}
              <InfoPanel $theme={theme}>
                <div>
                  <span className="LeftItem">Sender</span>
                  {info
                    ? renderAccountItem(
                        info.actionMeta.from,
                        info.actionMeta.accountName
                      )
                    : '-'}
                </div>
              </InfoPanel>

              {/** Transaction Specific Data */}
              {info && renderSummaryForTx()}

              {/** Estimated Fee */}
              <InfoPanel $theme={theme}>
                <div>
                  <span className="LeftItem">Estimated Fee</span>
                  {renderEstimatedFee()}
                </div>
              </InfoPanel>
            </Styles.FlexColumn>
            <Dialog.Close className="Dialog__Button">Close</Dialog.Close>
          </Styles.FlexColumn>
        </Styles.DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
