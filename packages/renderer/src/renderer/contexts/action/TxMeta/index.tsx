// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigAction } from '@ren/config/processes/action';
import { chainIcon } from '@ren/config/chains';
import { Flip, toast } from 'react-toastify';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as defaults from './defaults';
import type { AnyJson } from '@polkadot-live/types/misc';
import type { ToastOptions } from 'react-toastify';
import type { TxMetaContextInterface } from './types';
import type {
  ActionMeta,
  AddressInfo,
  ExtrinsicDynamicInfo,
  ExtrinsicInfo,
  TxStatus,
} from '@polkadot-live/types/tx';
import { setStateWithRef } from '@w3ux/utils';
import { SignOverlay } from '@app/screens/Action/SignOverlay';
import { useOverlay } from '@polkadot-live/ui/contexts';

export const TxMetaContext = createContext<TxMetaContextInterface>(
  defaults.defaultTxMeta
);

export const useTxMeta = () => useContext(TxMetaContext);

export const TxMetaProvider = ({ children }: { children: React.ReactNode }) => {
  const { openOverlayWith } = useOverlay();

  /**
   * Collection of active extrinsics.
   */
  const [extrinsics, setExtrinsics] = useState<Map<string, ExtrinsicInfo>>(
    new Map()
  );
  const extrinsicsRef = useRef<Map<string, ExtrinsicInfo>>(extrinsics);
  const [updateCache, setUpdateCache] = useState(false);

  /**
   * Minimal account info to associate extrinsics with an address.
   */
  const [addressesInfo, setAddressesInfo] = useState<AddressInfo[]>([]);

  /**
   * Cache the addresses select box value.
   */
  const [selectedFilter, setSelectedFilter] = useState('all');
  const selectedFilterRef = useRef<string>('all');

  /**
   * Flag to enable mock UI.
   */
  const [showMockUI] = useState(false);

  /**
   * Mechanism to update the extrinsics map when its reference is updated.
   */
  useEffect(() => {
    if (updateCache) {
      setExtrinsics(extrinsicsRef.current);

      // Rebuild addresses data.
      const map = new Map<string, AddressInfo>();

      for (const {
        actionMeta: { accountName, from, chainId },
      } of extrinsicsRef.current.values()) {
        if (map.has(from)) {
          continue;
        }

        map.set(from, {
          accountName,
          address: from,
          ChainIcon: chainIcon(chainId),
          chainId,
        });
      }

      setAddressesInfo([...Array.from(map.values())]);
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
    // Set selected account to the new transaction signer.
    if (selectedFilterRef.current !== 'all') {
      setStateWithRef(actionMeta.from, setSelectedFilter, selectedFilterRef);
    }

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
      // Relay building extrinsic flag to app.
      window.myAPI.relayModeFlag('isBuildingExtrinsic', false);

      renderToast(
        'Extrinsic already added.',
        `toast-${actionMeta.eventUid}-${actionMeta.action}`,
        'error'
      );

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

    // Initialize tx in main renderer process.
    initEstimatedFee(txId);
    setUpdateCache(true);
  };

  /**
   * Instructs the main renderer to calculate and return an extrinsic's
   * estimated fee.
   */
  const initEstimatedFee = (txId: string) => {
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
      window.myAPI.relayModeFlag('isBuildingExtrinsic', false);
      console.log(err);
    }
  };

  /**
   * Sets an extrinsic's estimated fee received from the main renderer.
   */
  const setEstimatedFee = (txId: string, estimatedFee: string) => {
    try {
      const obj = extrinsicsRef.current.get(txId);
      if (!obj) {
        throw new Error('Error: Extrinsic not found.');
      }

      obj.estimatedFee = estimatedFee;
      setUpdateCache(true);

      renderToast(
        'Extrinsic added.',
        `toast-${obj.actionMeta.eventUid}-${obj.actionMeta.action}`,
        'success'
      );
    } catch (err) {
      console.log(err);
    } finally {
      // Relay building extrinsic flag to app.
      window.myAPI.relayModeFlag('isBuildingExtrinsic', false);
    }
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

      // Relay building extrinsic flag to app.
      window.myAPI.relayModeFlag('isBuildingExtrinsic', true);

      ConfigAction.portAction.postMessage({
        task: 'renderer:tx:build',
        data: JSON.stringify(info),
      });
    } catch (err) {
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

      const { from } = obj.actionMeta;
      openOverlayWith(<SignOverlay txId={txId} from={from} />, 'small', true);
    } catch (err) {
      console.log(err);
    } finally {
      window.myAPI.relayModeFlag('isBuildingExtrinsic', false);
    }
  };

  /**
   * Send a completed and signed extrinsic to main renderer for submission.
   */
  const submitTx = (txId: string) => {
    window.myAPI.relayModeFlag('isBuildingExtrinsic', true);

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
      window.myAPI.relayModeFlag('isBuildingExtrinsic', false);
    }
  };

  /**
   * Submit a mock extrinsic.
   */
  const submitMockTx = (txId: string) => {
    window.myAPI.relayModeFlag('isBuildingExtrinsic', true);

    const info = extrinsicsRef.current.get(txId);
    if (!info) {
      throw new Error('Error: Extrinsic not found.');
    }

    // Send extrinsic info to main renderer and submit.
    ConfigAction.portAction.postMessage({
      task: 'renderer:tx:mock:submit',
      data: { info: JSON.stringify(info) },
    });
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

      if (txStatus === 'error' || txStatus === 'finalized') {
        window.myAPI.relayModeFlag('isBuildingExtrinsic', false);
      }
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
  const removeExtrinsic = (txUid: string, fromAddress: string) => {
    if (extrinsicsRef.current.delete(txUid)) {
      // Remove cached transaction in main process.
      ConfigAction.portAction.postMessage({
        task: 'renderer:tx:delete',
        data: { txId: txUid },
      });

      // Remove address info if there are no more extrinsics for the address.
      const found = Array.from(extrinsicsRef.current.values()).find(
        ({ actionMeta: { from } }) => from === fromAddress
      );

      if (!found) {
        // Update cached address state.
        setAddressesInfo((prev) =>
          prev.filter(({ address }) => address !== fromAddress)
        );

        // Display all extrinsics.
        setStateWithRef('all', setSelectedFilter, selectedFilterRef);
      }

      renderToast('Extrinsic removed.', `toast-remove-${txUid}`, 'success');
      setUpdateCache(true);
    }
  };

  /**
   * Filter extrinsics base on signer's address and sort alphabetically.
   */
  const getFilteredExtrinsics = () =>
    selectedFilterRef.current === 'all'
      ? Array.from(extrinsics.values()).sort((a, b) => {
          const titleA = getHeaderTitle(a).toLowerCase();
          const titleB = getHeaderTitle(b).toLowerCase();
          return titleA.localeCompare(titleB);
        })
      : Array.from(extrinsics.values())
          .filter(
            ({ actionMeta: { from } }) => from === selectedFilterRef.current
          )
          .sort((a, b) => {
            const titleA = getHeaderTitle(a).toLowerCase();
            const titleB = getHeaderTitle(b).toLowerCase();
            return titleA.localeCompare(titleB);
          });

  /**
   * Update select filter and address info when filter changes.
   */
  const onFilterChange = (val: string) => {
    setStateWithRef(val, setSelectedFilter, selectedFilterRef);
  };

  /**
   * Update an account name assocated with an address.
   */
  const updateAccountName = (address: string, newName: string) => {
    // Update extrinsics state in actionMeta.
    for (const [txId, info] of Array.from(extrinsicsRef.current.entries())) {
      if (info.actionMeta.from !== address) {
        continue;
      }

      extrinsicsRef.current.set(txId, {
        ...info,
        actionMeta: { ...info.actionMeta, accountName: newName },
      });
    }

    // Update addresses info state.
    setAddressesInfo((prev) => {
      const updated = prev.map((i) => {
        if (i.address === address) {
          return { ...i, accountName: newName };
        } else {
          return { ...i };
        }
      });

      return updated;
    });

    setUpdateCache(true);
  };

  /**
   * Utility to get cartegory title.
   */
  const getCategoryTitle = (info: ExtrinsicInfo): string => {
    switch (info.actionMeta.pallet) {
      case 'nominationPools': {
        return 'Nomination Pools';
      }
      default: {
        return 'Unknown.';
      }
    }
  };

  /**
   * Utility to get the accordion header title for an extrinsic.
   */
  const getHeaderTitle = (info: ExtrinsicInfo): string => {
    switch (info.actionMeta.action) {
      case 'nominationPools_pendingRewards_bond': {
        return 'Compound Rewards';
      }
      case 'nominationPools_pendingRewards_withdraw': {
        return 'Claim Rewards';
      }
    }
  };

  /**
   * Util for rendering a toast notification.
   */
  const renderToast = (
    message: string,
    toastId: string,
    toastType: 'error' | 'success'
  ) => {
    const args: ToastOptions<unknown> = {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      closeButton: false,
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
      theme: 'dark',
      transition: Flip,
      toastId,
    };

    toastType === 'success'
      ? toast.success(message, args)
      : toast.error(message, args);
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
        addressesInfo,
        extrinsics,
        showMockUI,
        selectedFilter,
        getCategoryTitle,
        getFilteredExtrinsics,
        getGenesisHash,
        getTxPayload,
        initTx,
        initTxDynamicInfo,
        onFilterChange,
        setEstimatedFee,
        setTxDynamicInfo,
        setTxSignature,
        submitMockTx,
        submitTx,
        updateAccountName,
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
