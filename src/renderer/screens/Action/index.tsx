// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ActionItem } from '@/renderer/library/ActionItem';
import { ButtonMonoInvert } from '@/renderer/kits/Buttons/ButtonMonoInvert';
import { chainIcon } from '@/config/chains';
import { ContentWrapper } from '@app/screens/Wrappers';
import { DragClose } from '@app/library/DragClose';
import { ellipsisFn } from '@w3ux/utils';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Signer } from './Signer';
import { SubmittedTxWrapper } from './Wrappers';
import { Tx } from '@/renderer/library/Tx';
import { useAddresses } from '@app/contexts/Addresses';
import { useEffect, useState } from 'react';
import { useTxMeta } from '@app/contexts/TxMeta';
import type { AnyJson } from '@/types/misc';
import type { IpcRendererEvent } from 'electron';
import type { TxStatus } from '@/types/tx';

export const Action = () => {
  const { getAddress } = useAddresses();
  const { actionMeta, setTxPayload, setGenesisHash, getTxSignature } =
    useTxMeta();

  const ChainIcon = chainIcon('Polkadot');

  const chainId = actionMeta?.chainId || 'Polkadot';
  const uid = actionMeta?.uid || '';
  const action = actionMeta?.action || '';
  const from = actionMeta?.address || '';
  const actionData = actionMeta?.data || {};

  // TODO: Fix
  const nonce = 0;

  const fromAccount = getAddress(from);
  const fromName = fromAccount?.name || ellipsisFn(from);

  // Store the estimated tx fee.
  const [estimatedFee, setEstimatedFee] = useState<string>('...');

  // Store whether the tx is submitting.
  const [submitting] = useState<boolean>(false);

  // Store the txId.
  const [txId, setTxId] = useState(0);

  // Store tx status
  const [txStatus, setTxStatus] = useState<TxStatus>('pending');

  // Initiate the tx on main and return tx data.
  useEffect(() => {
    window.myAPI.requestInitTx(
      'Polkadot',
      from,
      nonce,
      'nominationPools',
      'bondExtra',
      ['Rewards']
    );
  }, [from, nonce]);

  // Auto transaction submission and event dismiss when signature updates.
  useEffect(() => {
    if (getTxSignature()) {
      window.myAPI.reportSignedVaultTx(getTxSignature());
      window.myAPI.requestDismissEvent({
        uid,
        who: {
          chain: chainId,
          address: from,
        },
      });
    }
  }, [getTxSignature()]);

  useEffect(() => {
    // Update tx state received from the main extrinsics controller new() method.
    window.myAPI.reportTx((_: IpcRendererEvent, txData: AnyJson) => {
      setEstimatedFee(txData.estimatedFee);
      setTxId(txData.txId);
      setTxPayload(txData.txId, txData.payload);
      setGenesisHash(txData.genesisHash);
    });

    // Update tx status received from the main extrinsics controller submit() method.
    window.myAPI.reportTxStatus((_: IpcRendererEvent, status: TxStatus) => {
      setTxStatus(status);
    });

    return () => {
      // Reset data in the main extrinsics controller.
      window.myAPI.requestResetTx();
    };
  }, []);

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
