// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Tx } from '@polkadot-live/ui/components';
import { chainCurrency } from '@ren/config/chains';
import { ContentWrapper } from '@app/screens/Wrappers';
import { ellipsisFn } from '@w3ux/utils';
import { Signer } from './Signer';
import { useEffect } from 'react';
import { useTxMeta } from '@app/contexts/action/TxMeta';
import { useActionMessagePorts } from '@app/hooks/useActionMessagePorts';
import { useDebug } from '@app/hooks/useDebug';
import { TxActionItem } from './TxActionItem';
import { Scrollable } from '@polkadot-live/ui/styles';
import type { TxStatus } from 'packages/types/src';

//import { ButtonMonoInvert } from '@polkadot-live/ui/kits/buttons';
//import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//import { SubmittedTxWrapper } from './Wrappers';

export const Action = () => {
  // Set up port communication for `action` window.
  useActionMessagePorts();
  useDebug(window.myAPI.getWindowId());

  // Get state and setters from TxMeta context.
  const { extrinsics } = useTxMeta();

  // Reset data in the main extrinsics controller on unmount.
  useEffect(
    () => () => {
      try {
        // TODO: Get stored extrinsic data from main.
      } catch (err) {
        console.log('Warning: Action port not received yet: renderer:tx:reset');
      }
    },
    []
  );

  // Utility to get title based on tx status.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getTxStatusTitle = (txStatus: TxStatus): string => {
    switch (txStatus) {
      case 'pending':
        return 'Transaction Pending';
      case 'submitted':
        return 'Transaction Submitted';
      case 'in_block':
        return 'Transaction In Block';
      case 'finalized':
        return 'Transaction Finalized';
      default:
        return 'An Error Occured';
    }
  };

  // Utility to get subtitle based on tx status.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getTxStatusSubtitle = (txStatus: TxStatus): string | null => {
    switch (txStatus) {
      case 'submitted':
        return 'Waiting for block confirmation...';
      case 'in_block':
        return 'Waiting for finalized confirmation...';
      default:
        return null;
    }
  };

  return (
    <Scrollable
      $footerHeight={0}
      $headerHeight={0}
      style={{ paddingTop: 0, paddingBottom: 20 }}
    >
      {/*
      {txStatus !== 'pending' && (
        <SubmittedTxWrapper>
          <div>
            <FontAwesomeIcon
              icon={faCheckCircle}
              style={{ width: '75px', height: '75px' }}
            />
          </div>
          <h2>{getTxStatusTitle()}</h2>
          <h4>{getTxStatusSubtitle() || `This window can be closed.`}</h4>
          <div className="close">
            <ButtonMonoInvert
              text="Close Window"
              lg
              onClick={() => window.close()}
            />
          </div>
        </SubmittedTxWrapper>
      )}
      */}
      <ContentWrapper>
        {Array.from(extrinsics.keys()).length === 0 && (
          <p>No extrinsics created yet...</p>
        )}

        {Array.from(extrinsics.keys()).length !== 0 &&
          Array.from(extrinsics.entries()).map(([txUid, info]) => (
            <div key={txUid} style={{ padding: '1rem 0' }}>
              <TxActionItem
                action={info.actionMeta.action}
                actionData={info.actionMeta.data}
                chainId={info.actionMeta.chainId}
                key={info.txId}
              />

              <Tx
                label={'Signer'}
                name={ellipsisFn(info.actionMeta.from)}
                notEnoughFunds={false}
                dangerMessage={'Danger message'}
                estimatedFee={
                  info.dynamicInfo === undefined
                    ? '-'
                    : `${info.dynamicInfo?.estimatedFee} ${chainCurrency(info.actionMeta.chainId)}`
                }
                SignerComponent={
                  <Signer
                    txId={info.txId}
                    txBuilt={info.dynamicInfo !== undefined}
                    submitting={info.submitting}
                    valid={!info.submitting}
                    from={info.actionMeta.from}
                  />
                }
              />
            </div>
          ))}
      </ContentWrapper>
    </Scrollable>
  );
};
