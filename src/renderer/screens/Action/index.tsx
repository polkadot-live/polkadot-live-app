// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ActionItem } from '@/renderer/library/ActionItem';
import { ButtonMonoInvert } from '@/renderer/kits/Buttons/ButtonMonoInvert';
import { chainIcon } from '@/config/chains';
import { Config as ConfigAction } from '@/config/processes/action';
import { ContentWrapper } from '@app/screens/Wrappers';
import { DragClose } from '@app/library/DragClose';
import { ellipsisFn } from '@w3ux/utils';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Signer } from './Signer';
import { SubmittedTxWrapper } from './Wrappers';
import { Tx } from '@/renderer/library/Tx';
import { useEffect, useState } from 'react';
import { useTxMeta } from '@app/contexts/TxMeta';
import BigNumber from 'bignumber.js';

export const Action = () => {
  // Get state and setters from TxMeta context.
  const { actionMeta, getTxSignature, estimatedFee, txId, txStatus } =
    useTxMeta();

  const ChainIcon = chainIcon('Polkadot');

  // Tx metadata.
  const action = actionMeta?.action || '';
  const actionData = actionMeta?.data || {};
  const uid = actionMeta?.uid || '';

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
        data: { chainId, from, nonce, pallet, method, args },
      });
    } catch (err) {
      console.log('Warning: Action port not received yet: renderer:tx:init');
    }
  }, [from, nonce]);

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

        // Update event show that it is stale and an action has been executed.
        ConfigAction.portAction.postMessage({
          task: 'renderer:event:update:stale',
          data: { uid, who: { chain: chainId, address: from } },
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
        return 'Transaction Pending...';
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
      <DragClose windowName="action" />
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
      <>
        <ContentWrapper>
          <h5>
            <ChainIcon className="icon" />
            Nomination Pools
          </h5>

          {action === 'nominationPools_pendingRewards_bond' && (
            <>
              <h3>Bond Rewards</h3>
              <div className="body">
                <ActionItem text={`Claim ${actionData.extra.toString()} DOT`} />
                <p>
                  Once submitted, your rewards will be bonded back into the
                  pool. You own these additional bonded funds and will be able
                  to withdraw them at any time.
                </p>
              </div>
            </>
          )}

          {action === 'nominationPools_pendingRewards_withdraw' && (
            <>
              <h3>Withdraw Rewards</h3>
              <div className="body">
                <ActionItem text={`Claim ${actionData.extra} DOT`} />
                <p>
                  Withdrawing rewards will immediately transfer them to your
                  account as free balance.
                </p>
              </div>
            </>
          )}
        </ContentWrapper>

        <div style={{ position: 'fixed', bottom: 0, width: '100%' }}>
          <Tx
            label={'Signer'}
            name={fromName}
            notEnoughFunds={false}
            dangerMessage={'Danger message'}
            SignerComponent={
              <Signer
                txId={txId}
                chain={chainId}
                submitting={submitting}
                valid={
                  !submitting && estimatedFee !== '...' && nonce !== undefined
                }
                estimatedFee={estimatedFee}
                from={from}
              />
            }
          ></Tx>
        </div>
      </>
    </>
  );
};
