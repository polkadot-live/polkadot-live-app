// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ActionItem } from '@/renderer/library/ActionItem';
import { ButtonMonoInvert } from '@/renderer/kits/Buttons/ButtonMonoInvert';
import { chainIcon } from '@/config/chains';
import { ConfigRenderer } from '@/config/ConfigRenderer';
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
import type { ChainID } from '@/types/chains';
import type { FlattenedAccountData } from '@/types/accounts';

export const Action = () => {
  // Get state and setters from TxMeta context.
  const { actionMeta, getTxSignature, estimatedFee, txId, txStatus } =
    useTxMeta();

  const ChainIcon = chainIcon('Polkadot');

  const chainId = actionMeta?.chainId || 'Polkadot';
  const action = actionMeta?.action || '';
  const fromAccount: FlattenedAccountData | null = actionMeta?.account || null;
  const from = fromAccount?.address || '';
  const actionData = actionMeta?.data || {};
  //const uid = actionMeta?.uid || '';

  // TODO: Fix
  const nonce = 0;
  const fromName = fromAccount?.name || ellipsisFn(from);

  // Store whether the tx is submitting.
  const [submitting] = useState<boolean>(false);

  // Send message to main renderer to initiate a new transaction.
  useEffect(() => {
    try {
      ConfigRenderer.portAction.postMessage({
        task: 'main:tx:init',
        data: {
          chainId: 'Polkadot' as ChainID,
          from,
          nonce,
          pallet: 'nominationPools',
          method: 'bondExtra',
          args: ['Rewards'],
        },
      });
    } catch (err) {
      console.log('Warning: Action port not received yet: main:tx:init');
    }
  }, [from, nonce]);

  // Auto transaction submission and event dismiss when signature updates.
  useEffect(() => {
    if (getTxSignature()) {
      try {
        // Send signature and submit transaction on main window.
        ConfigRenderer.portAction.postMessage({
          task: 'main:tx:vault:submit',
          data: {
            signature: getTxSignature(),
          },
        });

        // TODO: Instead of removing the event entirely, update it to show that
        // the action has been acted upon.
        /** 
        window.myAPI.requestDismissEvent({
          uid,
          who: {
            chain: chainId,
            address: from,
          },
        });
        */
      } catch (err) {
        console.log(
          'Warning: Action port not received yet: main:tx:vault:submit'
        );
      }
    }
  }, [getTxSignature()]);

  useEffect(
    () => () => {
      try {
        console.log('post main:tx:init');

        // Reset data in the main extrinsics controller.
        ConfigRenderer.portAction.postMessage({
          task: 'main:tx:reset',
        });
      } catch (err) {
        console.log('Warning: Action port not received yet: main:tx:reset');
      }
    },
    []
  );

  // TODO: Implement functions getTxStatusTitle() and getTxStatusSubtitle().
  let txStatusTitle = '';
  let txStatusSubtitle = '';
  switch (txStatus) {
    case 'pending':
      txStatusTitle = 'Transaction Pending...';
      break;
    case 'submitted':
      txStatusTitle = 'Transaction Submitted';
      txStatusSubtitle = 'Waiting for block confirmation...';
      break;
    case 'in_block':
      txStatusTitle = 'Transaction In Block';
      txStatusSubtitle = 'Waiting for finalized confirmation...';
      break;
    case 'finalized':
      txStatusTitle = 'Transaction Finalized.';
      break;
    default:
      txStatusTitle = 'An Error Occured';
      break;
  }

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
          <h2>{txStatusTitle}</h2>
          <h4>{txStatusSubtitle || `This window can be closed.`}</h4>
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
                <ActionItem text={`Claim ${actionData.pendingRewards} DOT`} />
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
                <ActionItem text={`Claim ${actionData.pendingRewards} DOT`} />
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
                nonce={nonce}
                from={from}
              />
            }
          ></Tx>
        </div>
      </>
    </>
  );
};
