// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as wc from '@polkadot-live/consts/walletConnect';
import { ExtrinsicError, generateUID } from '@polkadot-live/core';
import React, { createContext, useEffect, useRef, useState } from 'react';
import type { AnyData, AnyJson } from '@polkadot-live/types/misc';
import type { TxMetaContextInterface } from '@polkadot-live/contexts/types/action';
import type {
  ActionMeta,
  AddressInfo,
  ExtFilterOption,
  ExTransferKeepAliveData,
  ExtrinsicDynamicInfo,
  ExtrinsicInfo,
  PagedExtrinsicItems,
  TxStatus,
} from '@polkadot-live/types/tx';
import { setStateWithRef } from '@w3ux/utils';
import { useConnections } from '../../../contexts';
import { useOverlay } from '@polkadot-live/ui/contexts';
import { createSafeContextHook } from '@polkadot-live/contexts';
import { renderToast } from '@polkadot-live/ui/utils';
import { WalletConnectModal } from '@walletconnect/modal';
import { ChainIcon } from '@polkadot-live/ui/components';
import {
  SignLedgerOverlay,
  SignVaultOverlay,
  SignWcOverlay,
} from '../../screens';
import type { ChainID } from '@polkadot-live/types/chains';

const PAGINATION_ITEMS_PER_PAGE = 10;

export const TxMetaContext = createContext<TxMetaContextInterface | undefined>(
  undefined
);

export const useTxMeta = createSafeContextHook(TxMetaContext, 'TxMetaContext');

export const TxMetaProvider = ({ children }: { children: React.ReactNode }) => {
  const { relayState } = useConnections();
  const {
    openOverlayWith,
    setDisableClose,
    setStatus: setOverlayStatus,
  } = useOverlay();

  /**
   * Collection of active extrinsics.
   */
  const [extrinsics, setExtrinsics] = useState<Map<string, ExtrinsicInfo>>(
    new Map()
  );
  const extrinsicsRef = useRef<Map<string, ExtrinsicInfo>>(extrinsics);
  const [updateCache, setUpdateCache] = useState(false);

  /**
   * State for filter options.
   */
  const [filterOptions, setFilterOptions] = useState<ExtFilterOption[]>([
    { filter: 'pending', label: 'Pending', selected: true },
    { filter: 'finalized', label: 'Finalized', selected: true },
    { filter: 'in_block', label: 'In Block', selected: true },
    { filter: 'submitted', label: 'Submitted', selected: true },
    { filter: 'error', label: 'Error', selected: true },
    { filter: 'submitted-unknown', label: 'Unknown', selected: true },
  ]);

  const setFilterOption = (filter: TxStatus, selected: boolean) => {
    setFilterOptions((pv) =>
      pv.map((f) => (f.filter === filter ? { ...f, selected } : f))
    );
  };

  const getSortedFilterOptions = (section: 'top' | 'bottom') => {
    const filters =
      section === 'top'
        ? ['error', 'finalized', 'pending']
        : ['in_block', 'submitted', 'submitted-unknown'];

    return filterOptions
      .filter(({ filter }) => filters.includes(filter))
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  /**
   * Pagination state for extrinsic items.
   */
  const [pagedExtrinsics, setPagedExtrinsics] = useState<PagedExtrinsicItems>({
    page: 1,
    pageCount: 1,
    items: [],
  });

  const getPageCount = (): number => {
    const len = getFilteredExtrinsics().length;
    return Math.ceil(len / PAGINATION_ITEMS_PER_PAGE);
  };

  const getExtrinsicsPage = (page: number): ExtrinsicInfo[] => {
    const start = (page - 1) * PAGINATION_ITEMS_PER_PAGE;
    const end = start + PAGINATION_ITEMS_PER_PAGE;
    return getFilteredExtrinsics().slice(start, end);
  };

  const getPageNumbers = (): number[] => {
    const { page, pageCount } = pagedExtrinsics;
    if (pageCount <= 4) {
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    } else {
      const start = [1, 2];
      const end = [pageCount - 1, pageCount];
      const insert = !start.includes(page) && !end.includes(page);
      return insert ? [...start, page, ...end] : [...start, ...end];
    }
  };

  const setPage = (page: number) => {
    setPagedExtrinsics((pv) => ({ ...pv, page }));
  };

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
   * WalletConnect modal.
   */
  const wcModal = useRef<WalletConnectModal | null>(null);

  /**
   * Parse serialized extrinsic data to object.
   * Must be called before caching a received extrinsic item.
   */
  const parseExtrinsicData = (meta: ActionMeta) => {
    const { action, data } = meta;
    switch (action) {
      case 'balances_transferKeepAlive': {
        if (typeof data === 'string') {
          const p_data: ExTransferKeepAliveData = JSON.parse(data);
          meta.data = p_data;
        }
        return;
      }
      default: {
        return;
      }
    }
  };

  /**
   * Instantiate WalletConnect modal when component mounts.
   */
  useEffect(() => {
    if (!wcModal.current) {
      const modal = new WalletConnectModal({
        enableExplorer: false,
        explorerRecommendedWalletIds: 'NONE',
        explorerExcludedWalletIds: 'ALL',
        projectId: wc.WC_PROJECT_IDS['electron'],
      });
      wcModal.current = modal;
    }
  }, []);

  /**
   * Initialize chrome runtime listeners.
   */
  useEffect(() => {
    const callback = (message: AnyData) => {
      if (message.type === 'extrinsics') {
        switch (message.task) {
          case 'txError': {
            const { message: msg }: { message: string } = message.payload;
            notifyInvalidExtrinsic(msg);
            break;
          }
          case 'reportTxStatus': {
            const { txId, status }: { txId: string; status: TxStatus } =
              message.payload;

            if ((['finalized', 'error'] as TxStatus[]).includes(status)) {
              relayState('extrinsic:building', false);
            }
            if (status === 'finalized') {
              const { txHash }: { txHash: `0x${string}` } = message.payload;
              setTxHash(txId, txHash);
            }
            updateTxStatus(txId, status);
            break;
          }
          case 'closeOverlay': {
            setDisableClose(false);
            setOverlayStatus(0);
            break;
          }
          case 'tryInitTx': {
            const { actionMeta }: { actionMeta: ActionMeta } = message.payload;
            initTx(actionMeta);
            break;
          }
          case 'updateAccountNames': {
            const { address, chainId, newName } = message.payload;
            updateAccountName(address, chainId, newName);
            break;
          }
        }
      }
    };
    chrome.runtime.onMessage.addListener(callback);
    return () => {
      chrome.runtime.onMessage.removeListener(callback);
    };
  }, []);

  /**
   * Initialize any pending extrinsics on mount.
   */
  useEffect(() => {
    const fetchPending = async () => {
      const pendingMeta = (await chrome.runtime.sendMessage({
        type: 'extrinsics',
        task: 'initTx',
      })) as ActionMeta | null;
      pendingMeta && initTx(pendingMeta);
    };
    fetchPending();
  }, []);

  /**
   * Fetch stored extrinsics on mount.
   */
  useEffect(() => {
    const fetch = async () => {
      const result = (await chrome.runtime.sendMessage({
        type: 'extrinsics',
        task: 'getAll',
      })) as ExtrinsicInfo[];

      // Set status to `submitted-unknown` if app was closed before tx was finalized.
      for (const info of result) {
        if (info.txStatus === 'submitted' || info.txStatus === 'in_block') {
          info.txStatus = 'submitted-unknown';
          await updateStoreInfo(info);
        }
        extrinsicsRef.current.set(info.txId, { ...info });
      }
      setUpdateCache(true);
    };
    fetch();
  }, []);

  /**
   * Listen for new extrinsics data from backup import.
   */
  useEffect(() => {
    const callback = (message: AnyData) => {
      if (message.type === 'extrinsics') {
        switch (message.task) {
          case 'import:setExtrinsics': {
            const { ser }: { ser: string } = message.payload;
            const arr: [string, ExtrinsicInfo][] = JSON.parse(ser);
            const map = new Map<string, ExtrinsicInfo>(arr);
            extrinsicsRef.current = map;
            setUpdateCache(true);
          }
        }
      }
    };
    chrome.runtime.onMessage.addListener(callback);
    return () => {
      chrome.runtime.onMessage.removeListener(callback);
    };
  }, []);

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
          ChainIcon: <ChainIcon chainId={chainId} />,
          chainId,
        });
      }
      setAddressesInfo([...Array.from(map.values())]);
      setUpdateCache(false);
    }
  }, [updateCache]);

  /**
   * Update paged extrinsics on state changes.
   */
  useEffect(() => {
    const items = getExtrinsicsPage(pagedExtrinsics.page);
    const pageCount = getPageCount();
    setPagedExtrinsics((pv) => ({ ...pv, pageCount, items }));
  }, [pagedExtrinsics.page, updateCache, selectedFilter, filterOptions]);

  /**
   * Reset active page when filter changes.
   */
  useEffect(() => {
    setPage(1);
  }, [selectedFilter]);

  /**
   * Initialize an extrinsic.
   */
  const initTx = (actionMeta: ActionMeta) => {
    // Set selected account to the new transaction signer.
    if (selectedFilterRef.current !== 'all') {
      setStateWithRef(actionMeta.from, setSelectedFilter, selectedFilterRef);
    }

    // Parse data property correctly before storing state.
    parseExtrinsicData(actionMeta);

    // Check if this extrinsic has already been initialized.
    const { action, from } = actionMeta;
    const alreadyExists = Array.from(extrinsicsRef.current.values()).find(
      (info) => {
        if (action === info.actionMeta.action) {
          switch (action) {
            case 'balances_transferKeepAlive': {
              // Allow duplicate transfer extrinsics.
              return false;
            }
            case 'nominationPools_pendingRewards_bond':
            case 'nominationPools_pendingRewards_withdraw': {
              // Duplicate if signer and rewards are the same.
              const { extra }: { extra: string } = actionMeta.data;
              const found =
                from === info.actionMeta.from &&
                extra === info.actionMeta.data.extra &&
                info.txStatus === 'pending';
              return found ? true : false;
            }
          }
        } else {
          return false;
        }
      }
    );

    if (alreadyExists !== undefined) {
      relayState('extrinsic:building', false);
      renderToast(
        'Extrinsic already added.',
        `toast-already-exists-${String(Date.now())}`,
        'error'
      );
      return;
    }

    const txId = generateUID();
    const info: ExtrinsicInfo = {
      actionMeta,
      txId,
      txStatus: 'pending',
      timestamp: Date.now(),
    };
    extrinsicsRef.current.set(txId, info);
    initEstimatedFeeAsync(info);
  };

  /**
   * Initialize an extrinsic's estimated fee.
   */
  const initEstimatedFeeAsync = async (info: ExtrinsicInfo) => {
    try {
      const estimatedFee = (await chrome.runtime.sendMessage({
        type: 'extrinsics',
        task: 'getEstimatedFee',
        payload: { info },
      })) as string;
      setEstimatedFee(info.txId, estimatedFee);
    } catch (err) {
      relayState('extrinsic:building', false);
      console.error(err);
    }
  };

  /**
   * Sets an extrinsic's estimated fee received from the main renderer.
   */
  const setEstimatedFee = async (txId: string, estimatedFee: string) => {
    try {
      const info = extrinsicsRef.current.get(txId);
      if (!info) {
        throw new ExtrinsicError('ExtrinsicNotFound');
      }
      info.estimatedFee = estimatedFee;
      setUpdateCache(true);

      chrome.runtime.sendMessage({
        type: 'extrinsics',
        task: 'persist',
        payload: { info },
      });
      renderToast(
        'Extrinsic added.',
        `toast-added-${String(Date.now())}`,
        'success'
      );
    } catch (err) {
      console.error(err);
    } finally {
      relayState('extrinsic:building', false);
    }
  };

  /**
   * Requests an extrinsic's dynamic data. Call before submitting an extrinsic.
   * Confirms the extrinsic is valid and can be submitted, by checking sufficient balances, etc.
   */
  const initTxDynamicInfo = (txId: string) => {
    try {
      const info = extrinsicsRef.current.get(txId);
      if (!info) {
        throw new ExtrinsicError('ExtrinsicNotFound');
      }
      relayState('extrinsic:building', true);

      interface I {
        accountNonce: number;
        genesisHash: `0x${string}`;
        txPayload: Uint8Array;
      }
      chrome.runtime
        .sendMessage({
          type: 'extrinsics',
          task: 'buildExtrinsic',
          payload: { info },
        })
        .then((result: I | null) => {
          // TODO: Handle null.
          if (result) {
            const { accountNonce, genesisHash, txPayload } = result;
            setTxDynamicInfo(txId, {
              accountNonce: String(accountNonce),
              genesisHash,
              txPayload,
            });
          }
        });
    } catch (err) {
      console.log(err);
    }
  };

  const getOverlayComponent = (info: ExtrinsicInfo) => {
    switch (info.actionMeta.source) {
      case 'vault':
        return <SignVaultOverlay info={info} />;
      case 'wallet-connect':
        return <SignWcOverlay info={info} />;
      case 'ledger':
        return <SignLedgerOverlay info={info} />;
      default:
        <span>Error: Unknown Source</span>;
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
      const info = extrinsicsRef.current.get(txId);
      if (!info) {
        throw new ExtrinsicError('ExtrinsicNotFound');
      }
      info.dynamicInfo = dynamicInfo;
      setUpdateCache(true);
      openOverlayWith(getOverlayComponent(info), 'small', true);
    } catch (err) {
      console.error(err);
    } finally {
      relayState('extrinsic:building', false);
    }
  };

  /**
   * Render an error notification if an extrinsic is not valid for submission.
   */
  const notifyInvalidExtrinsic = (message: string) => {
    relayState('extrinsic:building', false);
    const text = `Invalid extrinsic - ${message}`;
    renderToast(text, `invalid-extrinsic-${String(Date.now())}`, 'error');
  };

  /**
   * Send a completed and signed extrinsic to background worker for submission.
   */
  const submitTx = (txId: string) => {
    relayState('extrinsic:building', true);
    try {
      const info = extrinsicsRef.current.get(txId);
      if (!info) {
        throw new ExtrinsicError('ExtrinsicNotFound');
      }
      if (!info.dynamicInfo) {
        throw new ExtrinsicError('DynamicInfoUndefined');
      }
      if (!info.dynamicInfo.txSignature) {
        throw new ExtrinsicError('SignatureUndefined');
      }
      chrome.runtime.sendMessage({
        type: 'extrinsics',
        task: 'submit',
        payload: { info },
      });
    } catch (err) {
      console.error(err);
      relayState('extrinsic:building', false);
    }
  };

  /**
   * Submit a mock extrinsic.
   */
  const submitMockTx = (txId: string) => {
    relayState('extrinsic:building', true);
    const info = extrinsicsRef.current.get(txId);
    if (!info) {
      throw new ExtrinsicError('ExtrinsicNotFound');
    }
    chrome.runtime.sendMessage({
      type: 'extrinsics',
      task: 'submitMock',
      payload: { info },
    });
  };

  /**
   * Update the status of a transaction.
   */
  const updateTxStatus = async (txId: string, txStatus: TxStatus) => {
    try {
      const info = extrinsicsRef.current.get(txId);
      if (!info) {
        throw new ExtrinsicError('ExtrinsicNotFound');
      }
      info.txStatus = txStatus;
      setUpdateCache(true);
      if (txStatus === 'error' || txStatus === 'finalized') {
        relayState('extrinsic:building', false);
      }
      await updateStoreInfo(info);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Set a transaction's signature.
   */
  const setTxSignature = (txUid: string, s: AnyJson) => {
    const info = extrinsicsRef.current.get(txUid);
    if (!info) {
      console.error(new ExtrinsicError('ExtrinsicNotFound'));
      return;
    }
    if (!info.dynamicInfo) {
      console.error(new ExtrinsicError('DynamicInfoUndefined'));
      return;
    }
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
      console.error(new ExtrinsicError('ExtrinsicNotFound'));
      return null;
    }
    if (!info.dynamicInfo) {
      console.error(new ExtrinsicError('DynamicInfoUndefined'));
      return null;
    }
    return info.dynamicInfo.genesisHash;
  };

  /**
   * Removes an extrinsic from the collection.
   */
  const removeExtrinsic = async (info: ExtrinsicInfo) => {
    const { txId } = info;
    const fromAddress = info.actionMeta.from;

    if (extrinsicsRef.current.delete(txId)) {
      // Remove extrinsic from store.
      await chrome.runtime.sendMessage({
        type: 'extrinsics',
        task: 'remove',
        payload: { txId },
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
      renderToast('Extrinsic removed.', `toast-remove-${txId}`, 'success');
      setUpdateCache(true);
    }
  };

  /**
   * Filter extrinsics based on selected account and filter options.
   */
  const getFilteredExtrinsics = () => {
    let values = Array.from(extrinsics.values());

    // Apply account filter.
    if (selectedFilterRef.current !== 'all') {
      values = values.filter(
        ({ actionMeta: { from } }) => from === selectedFilterRef.current
      );
    }
    // Apply selected filters.
    const selected = filterOptions
      .filter((f) => f.selected)
      .map((f) => f.filter);

    return values
      .filter(({ txStatus }) => selected.includes(txStatus))
      .sort((a, b) => b.timestamp - a.timestamp);
  };

  /**
   * Update select filter and address info when filter changes.
   */
  const onFilterChange = (val: string) => {
    setStateWithRef(val, setSelectedFilter, selectedFilterRef);
  };

  /**
   * Update an account name assocated with an address.
   */
  const updateAccountName = async (
    address: string,
    chainId: ChainID,
    accountName: string
  ) => {
    const updatedInfos: ExtrinsicInfo[] = [];

    // Update extrinsics state in actionMeta.
    for (const [txId, info] of Array.from(extrinsicsRef.current.entries())) {
      if (info.actionMeta.action === 'balances_transferKeepAlive') {
        // Check signer and recipient account names.
        const { from, chainId: nextChainId } = info.actionMeta;
        const updateSigner = from === address && nextChainId === chainId;
        const data: ExTransferKeepAliveData = info.actionMeta.data;
        const updateRecipient =
          data.recipientAddress === address && nextChainId === chainId;

        if (updateSigner) {
          info.actionMeta.accountName = accountName;
        }
        if (updateRecipient) {
          info.actionMeta.data.recipientAccountName = accountName;
        }
        if (updateSigner || updateRecipient) {
          extrinsicsRef.current.set(txId, info);
          updatedInfos.push(info);
        }
      } else if (info.actionMeta.from === address) {
        // Update signer account name.
        info.actionMeta.accountName = accountName;
        extrinsicsRef.current.set(txId, info);
        updatedInfos.push(info);
      }
    }
    // Update store.
    for (const i of updatedInfos) {
      await updateStoreInfo(i);
    }
    // Update addresses info state.
    setAddressesInfo((prev) => {
      const updated = prev.map((i) => {
        if (i.address === address) {
          return { ...i, accountName };
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
      case 'balances': {
        return 'Balances';
      }
      default: {
        return 'Unknown.';
      }
    }
  };

  /**
   * Utility to handle opening and closing WalletConnect modal.
   */
  const handleOpenCloseWcModal = async (open: boolean, uri?: string) => {
    if (open && uri && wcModal.current) {
      await wcModal.current.openModal({ uri });
    }
    if (!open && wcModal.current) {
      wcModal.current.closeModal();
    }
  };

  /**
   * Import extrinsics data from backup file.
   */
  const importExtrinsics = (serialized: string) => {
    const parsed: ExtrinsicInfo[] = JSON.parse(serialized);
    const map = new Map<string, ExtrinsicInfo>();

    for (const info of parsed) {
      // Parse extrinsic dynamic data before caching state.
      parseExtrinsicData(info.actionMeta);
      map.set(info.txId, info);
    }
    extrinsicsRef.current = map;
    setUpdateCache(true);
  };

  /**
    Sets the transaction hash (txHash) for the extrinsic.
   */
  const setTxHash = (txId: string, txHash: `0x${string}`) => {
    try {
      const info = extrinsicsRef.current.get(txId);
      if (!info) {
        throw new ExtrinsicError('ExtrinsicNotFound');
      }
      info.txHash = txHash;
      extrinsicsRef.current.set(txId, info);
      setUpdateCache(true);
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * Utility to update extrinsics data in store.
   */
  const updateStoreInfo = async (info: ExtrinsicInfo) => {
    chrome.runtime.sendMessage({
      type: 'extrinsics',
      task: 'update',
      payload: { info: { ...info, dynamicInfo: undefined } },
    });
  };

  return (
    <TxMetaContext
      value={{
        addressesInfo,
        extrinsics,
        pagedExtrinsics,
        showMockUI,
        selectedFilter,
        getCategoryTitle,
        getExtrinsicsPage,
        getFilteredExtrinsics,
        getGenesisHash,
        getPageCount,
        getPageNumbers,
        getSortedFilterOptions,
        getTxPayload,
        handleOpenCloseWcModal,
        importExtrinsics,
        initTx,
        initTxDynamicInfo,
        onFilterChange,
        notifyInvalidExtrinsic,
        removeExtrinsic,
        setEstimatedFee,
        setFilterOption,
        setPage,
        setTxDynamicInfo,
        setTxHash,
        setTxSignature,
        submitMockTx,
        submitTx,
        updateAccountName,
        updateTxStatus,
      }}
    >
      {children}
    </TxMetaContext>
  );
};
