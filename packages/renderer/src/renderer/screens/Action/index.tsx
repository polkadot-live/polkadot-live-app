// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Tx } from '@polkadot-live/ui/components';
import BigNumber from 'bignumber.js';
import { ButtonMonoInvert } from '@polkadot-live/ui/kits/buttons';
import { chainCurrency } from '@ren/config/chains';
import { Config as ConfigAction } from '@ren/config/processes/action';
import { ContentWrapper } from '@app/screens/Wrappers';
import { ellipsisFn } from '@w3ux/utils';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Signer } from './Signer';
import { SubmittedTxWrapper } from './Wrappers';
import { useEffect, useState } from 'react';
import { useTxMeta } from '@app/contexts/action/TxMeta';
import { useActionMessagePorts } from '@app/hooks/useActionMessagePorts';
import { useDebug } from '@app/hooks/useDebug';
import { TxActionItem } from './TxActionItem';

export const Action = () => {
  // Set up port communication for `action` window.
  useActionMessagePorts();
  useDebug(window.myAPI.getWindowId());

  // Get state and setters from TxMeta context.
  const { actionMeta, getTxSignature, estimatedFee, txId, txStatus } =
    useTxMeta();

  // Tx metadata.
  const tmpUid = 'nominationPools_pendingRewards_bond'; // TODO: Remove soon.
  const action = actionMeta?.action || tmpUid;
  const actionData = actionMeta?.data || {};
  const eventUid = actionMeta?.eventUid || '';

  const from: string = actionMeta?.from || '';
  const fromName = actionMeta?.accountName || ellipsisFn(from);

  const chainId = actionMeta?.chainId || 'Polkadot';
  const nonce: BigNumber = actionMeta?.nonce || new BigNumber(0);
  const pallet = actionMeta?.pallet || '';
  const method = actionMeta?.method || '';
  const args = actionMeta?.args || [];

  // Store whether the tx is submitting.
  const [submitting] = useState<boolean>(false);

  // Send message to main renderer to initiate a new transaction.
  useEffect(() => {
    try {
      ConfigAction.portAction.postMessage({
        task: 'renderer:tx:init',
        data: { chainId, from, nonce, pallet, method, args, eventUid },
      });
    } catch (err) {
      console.log('Warning: Action port not received yet: renderer:tx:init');
    }
  }, [from, nonce, pallet, method]);

  // Auto transaction submission and event dismiss when signature updates.
  useEffect(() => {
    if (getTxSignature()) {
      try {
        // Send signature and submit transaction on main window.
        ConfigAction.portAction.postMessage({
          task: 'renderer:tx:vault:submit',
          data: {
            signature: getTxSignature(),
          },
        });
      } catch (err) {
        console.log(
          'Warning: Action port not received yet: renderer:tx:vault:submit'
        );
      }
    }
  }, [getTxSignature()]);

  // Reset data in the main extrinsics controller on unmount.
  useEffect(
    () => () => {
      try {
        console.log('post renderer:tx:reset');

        ConfigAction.portAction.postMessage({
          task: 'renderer:tx:reset',
        });
      } catch (err) {
        console.log('Warning: Action port not received yet: renderer:tx:reset');
      }
    },
    []
  );

  // Utility to get title based on tx status.
  const getTxStatusTitle = (): string => {
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
  const getTxStatusSubtitle = (): string | null => {
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
    <>
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
      <ContentWrapper>
        <TxActionItem
          action={action}
          actionData={actionData}
          chainId={chainId}
        />

        <Tx
          label={'Signer'}
          name={fromName}
          notEnoughFunds={false}
          dangerMessage={'Danger message'}
          estimatedFee={
            estimatedFee === '0'
              ? '...'
              : `${estimatedFee} ${chainCurrency(chainId)}`
          }
          SignerComponent={
            <Signer
              txId={txId}
              submitting={submitting}
              valid={
                !submitting && estimatedFee !== '...' && nonce !== undefined
              }
              from={from}
            />
          }
        />
      </ContentWrapper>
    </>
  );
};
