// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { setStateWithRef } from '@w3ux/utils';
import BigNumber from 'bignumber.js';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as defaults from './defaults';
import type { TxMetaContextInterface } from './types';
import type { AnyJson } from '@/types/misc';
import type { ActionMeta, TxStatus } from '@/types/tx';

export const TxMetaContext = createContext<TxMetaContextInterface>(
  defaults.defaultTxMeta
);

export const useTxMeta = () => useContext(TxMetaContext);

export const TxMetaProvider = ({ children }: { children: React.ReactNode }) => {
  const freeBalance = new BigNumber(1000000000);

  // Action window metadata.
  const [actionMeta, setActionMeta] = useState<ActionMeta | null>(null);

  // Transaction state.
  const [estimatedFee, setEstimatedFee] = useState<string>('...');
  const [notEnoughFunds, setNotEnoughFunds] = useState(false);
  const [sender, setSender] = useState<string | null>(null);
  const [txId, setTxId] = useState(0);
  const [txStatus, setTxStatus] = useState<TxStatus>('pending');
  const [txFees, setTxFees] = useState(new BigNumber(0));

  // Optional signed transaction if extrinsics require manual signing (e.g. Ledger).
  const [txSignature, setTxSignatureState] = useState<AnyJson>(null);
  const txSignatureRef = useRef(txSignature);

  // Store the payloads of transactions if extrinsics require manual signing (e.g. Ledger, Vault).
  // Payloads are calculated asynchronously and extrinsic associated with them may be cancelled. For
  // this reason we give every payload a txId, and check whether this txId matches the active
  // extrinsic before submitting it.
  const [txPayload, setTxPayloadState] = useState<{
    payload: AnyJson;
    txId: number;
  } | null>(null);
  const txPayloadRef = useRef(txPayload);

  // Store genesis hash of tx.
  const [genesisHash, setGenesisHashState] = useState<string | null>(null);
  const genesisHashRef = useRef(genesisHash);

  useEffect(() => {
    setNotEnoughFunds(freeBalance.minus(txFees).isLessThan(0));
  }, [txFees, sender]);

  const resetTxFees = () => {
    setTxFees(new BigNumber(0));
  };

  const getTxPayload = () => txPayloadRef.current?.payload || null;

  const setTxPayload = (theTxId: number, payload: AnyJson) => {
    setStateWithRef(
      {
        payload,
        txId: theTxId,
      },
      setTxPayloadState,
      txPayloadRef
    );
  };

  const resetTxPayloads = () => {
    setStateWithRef(null, setTxPayloadState, txPayloadRef);
  };

  const getGenesisHash = () => genesisHashRef.current;

  const setGenesisHash = (v: AnyJson) => {
    setStateWithRef(v, setGenesisHashState, genesisHashRef);
  };

  const getTxSignature = () => txSignatureRef.current;

  const setTxSignature = (s: AnyJson) => {
    setStateWithRef(s, setTxSignatureState, txSignatureRef);
  };

  const txFeesValid = (() => {
    if (txFees.isZero() || notEnoughFunds) {
      return false;
    }
    return true;
  })();

  return (
    <TxMetaContext.Provider
      value={{
        txFees,
        notEnoughFunds,
        setTxFees,
        resetTxFees,
        txFeesValid,
        sender,
        setSender,
        getTxPayload,
        setTxPayload,
        getGenesisHash,
        setGenesisHash,
        resetTxPayloads,
        getTxSignature,
        setTxSignature,

        actionMeta,
        setActionMeta,
        estimatedFee,
        setEstimatedFee,
        txId,
        setTxId,
        txStatus,
        setTxStatus,
      }}
    >
      {children}
    </TxMetaContext.Provider>
  );
};
