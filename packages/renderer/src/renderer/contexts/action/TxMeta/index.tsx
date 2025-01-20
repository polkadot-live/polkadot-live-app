// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigAction } from '@ren/config/processes/action';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as defaults from './defaults';
import type { TxMetaContextInterface } from './types';
import type { AnyJson } from '@polkadot-live/types/misc';
import type {
  ActionMeta,
  ExtrinsicDynamicInfo,
  ExtrinsicInfo,
  TxStatus,
} from '@polkadot-live/types/tx';

export const TxMetaContext = createContext<TxMetaContextInterface>(
  defaults.defaultTxMeta
);

export const useTxMeta = () => useContext(TxMetaContext);

export const TxMetaProvider = ({ children }: { children: React.ReactNode }) => {
  /**
   * Collection of active extrinsics.
   */
  const [extrinsics, setExtrinsics] = useState<Map<string, ExtrinsicInfo>>(
    new Map()
  );
  const extrinsicsRef = useRef<Map<string, ExtrinsicInfo>>(extrinsics);
  const [updateCache, setUpdateCache] = useState(false);

  /**
   * Mechanism to update the extrinsics map when its reference is updated.
   */
  useEffect(() => {
    if (updateCache) {
      setExtrinsics(extrinsicsRef.current);
      setUpdateCache(false);
    }
  }, [updateCache]);

  /**
   * Util for generating a UID in the browser.
   */
  const generateUID = (): string => {
    // Generate a random 16-byte array.
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);

    // Convert to a hexadecimal string.
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
      ''
    );
  };

  /**
   * Initialize an extrinsic.
   */
  const initTx = (actionMeta: ActionMeta) => {
    // Check if this extrinsic has already been initialized.
    const alreadyExists = Array.from(extrinsicsRef.current.values())
      .map((obj) => ({
        eventUid: obj.actionMeta.eventUid,
        action: obj.actionMeta.action,
      }))
      .find(
        ({ eventUid, action }) =>
          eventUid === actionMeta.eventUid && action === actionMeta.action
      );

    if (alreadyExists !== undefined) {
      console.log('> txId already exists.');
      return;
    }

    const txId = generateUID();
    const info: ExtrinsicInfo = {
      actionMeta,
      submitting: false,
      txId,
      txStatus: 'pending',
    };

    extrinsicsRef.current.set(txId, info);
    setUpdateCache(true);
  };

  /**
   * Requests an extrinsic's dynamic data. Call before submitting an extrinsic.
   */
  const initTxDynamicInfo = (txId: string) => {
    try {
      const info = extrinsics.get(txId);
      if (!info) {
        throw new Error('Error: Extrinsic not found.');
      }

      ConfigAction.portAction.postMessage({
        task: 'renderer:tx:init',
        data: JSON.stringify(info),
      });
    } catch (err) {
      console.log('Warning: Action port not received yet: renderer:tx:init');
      console.log(err);
    }
  };

  /**
   * Sets an extrinsic's dynamic data.
   */
  const setTxDynamicInfo = (
    txId: string,
    dynamicInfo: ExtrinsicDynamicInfo
  ) => {
    try {
      const obj = extrinsicsRef.current.get(txId);
      if (!obj) {
        throw new Error('Error: Extrinsic not found.');
      }

      obj.dynamicInfo = dynamicInfo;
      setUpdateCache(true);
    } catch (err) {
      console.log(err);
    }
  };

  /**
   * Send a completed and signed extrinsic to main renderer for submission.
   */
  const submitTx = (txId: string) => {
    try {
      const info = extrinsicsRef.current.get(txId);
      if (!info) {
        throw new Error('Error: Extrinsic not found.');
      }
      if (!info.dynamicInfo) {
        throw new Error('Error: Extrinsic dynamic info not found.');
      }
      if (!info.dynamicInfo.txSignature) {
        throw new Error('Error: Signature not found.');
      }

      // Send extrinsic info to main renderer and submit.
      ConfigAction.portAction.postMessage({
        task: 'renderer:tx:vault:submit',
        data: { info: JSON.stringify(info) },
      });
    } catch (err) {
      console.log(err);
    }
  };

  /**
   * Update the status of a transaction.
   */
  const updateTxStatus = (txId: string, txStatus: TxStatus) => {
    try {
      const info = extrinsicsRef.current.get(txId);
      if (!info) {
        throw new Error('Error: Extrinsic not found.');
      }

      info.txStatus = txStatus;
      setUpdateCache(true);
    } catch (err) {
      console.log(err);
    }
  };

  /**
   * Set a transaction's signature.
   */
  const setTxSignature = (txUid: string, s: AnyJson) => {
    const info = extrinsicsRef.current.get(txUid);
    if (!info) {
      console.log('> no extrinsic found.');
      return;
    }
    if (!info.dynamicInfo) {
      console.log('> no dynamic info found.');
      return;
    }

    // Set cache flag to update extrinsic state.
    info.dynamicInfo.txSignature = s;
    setUpdateCache(true);
  };

  /**
   * Get a transaction's raw payload.
   */
  const getTxPayload = (txUid: string) => {
    const info = extrinsicsRef.current.get(txUid);
    if (!info) {
      return null;
    }
    if (!info.dynamicInfo) {
      return null;
    }

    return info.dynamicInfo.txPayload;
  };

  /**
   * Get a transaction's raw genesis hash.
   */
  const getGenesisHash = (txUid: string) => {
    const info = extrinsicsRef.current.get(txUid);
    if (!info) {
      console.log('> no extrinsic found.');
      return null;
    }
    if (!info.dynamicInfo) {
      return null;
    }

    return info.dynamicInfo.genesisHash;
  };

  /**
   * Removes an extrinsic from the collection from the collection
   */
  const removeExtrinsic = (txUid: string) => {
    if (extrinsicsRef.current.delete(txUid)) {
      setUpdateCache(true);
    }
  };

  // Transaction state.
  //const [notEnoughFunds, setNotEnoughFunds] = useState(false);

  //const freeBalance = new BigNumber(1000000000);

  //useEffect(() => {
  //  setNotEnoughFunds(freeBalance.minus(txFees).isLessThan(0));
  //}, [txFees, sender]);

  //const resetTxFees = () => {
  //  setTxFees(new BigNumber(0));
  //};

  //const txFeesValid = (() => {
  //  if (txFees.isZero() || notEnoughFunds) {
  //    return false;
  //  }
  //  return true;
  //})();

  return (
    <TxMetaContext.Provider
      value={{
        extrinsics,
        getGenesisHash,
        getTxPayload,
        initTx,
        initTxDynamicInfo,
        setTxDynamicInfo,
        setTxSignature,
        submitTx,
        updateTxStatus,
        removeExtrinsic,

        //notEnoughFunds,
        //resetTxFees,
        //txFeesValid,
      }}
    >
      {children}
    </TxMetaContext.Provider>
  );
};
