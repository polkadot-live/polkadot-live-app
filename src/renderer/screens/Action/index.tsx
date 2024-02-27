// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ellipsisFn } from '@w3ux/utils';
import { chainIcon } from '@/config/chains';
import { useAccountState } from '@app/contexts/AccountState';
import { useAddresses } from '@app/contexts/Addresses';
import { useTxMeta } from '@app/contexts/TxMeta';
import type { IpcRendererEvent } from 'electron';
import { DragClose } from '@app/library/DragClose';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ContentWrapper } from '@app/screens/Wrappers';
import { Signer } from './Signer';
import { SubmittedTxWrapper } from './Wrappers';
import type { ChainID } from '@/types/chains';
import type { TxStatus } from '@/types/tx';
import type { AnyJson } from '@/types/misc';
import { ButtonMonoInvert } from '@/renderer/kits/Buttons/ButtonMonoInvert';
import { Tx } from '@/renderer/library/Tx';
import { ActionItem } from '@/renderer/library/ActionItem';

export const Action = () => {
  const { search } = useLocation();
  const { getAccountStateKey } = useAccountState();
  const { getAddress } = useAddresses();
  const { setTxPayload, setGenesisHash, getTxSignature } = useTxMeta();

  const ChainIcon = chainIcon('Polkadot');
  const searchParams = new URLSearchParams(search);

  const chain = decodeURIComponent(searchParams?.get('chain') || '') as ChainID;
  const uid = decodeURIComponent(searchParams?.get('uid') || '');
  const action = decodeURIComponent(searchParams?.get('action') || '');
  const from = decodeURIComponent(searchParams?.get('address') || '');
  const actionData = JSON.parse(
    decodeURIComponent(searchParams?.get('data') || '')
  );

  const nonce = getAccountStateKey('Polkadot', from, 'account')?.nonce;

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
          chain,
          address: from,
        },
      });
    }
  }, [getTxSignature()]);

  useEffect(() => {
    // Handle tx data from main.
    window.myAPI.reportTx((_: IpcRendererEvent, txData: AnyJson) => {
      setEstimatedFee(txData.estimatedFee);
      setTxId(txData.txId);
      setTxPayload(txData.txId, txData.payload);
      setGenesisHash(txData.genesisHash);
    });

    // Handle tx status from main
    window.myAPI.reportTxStatus((_: IpcRendererEvent, status: TxStatus) => {
      setTxStatus(status);
    });

    return () => {
      // Reset the transaction on unmount.
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
                chain={chain}
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
