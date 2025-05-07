// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as wc from '@polkadot-live/consts/walletConnect';
import { Config as ConfigAction } from '@ren/config/action';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as defaults from './defaults';
import type { AnyJson } from '@polkadot-live/types/misc';
import type { TxMetaContextInterface } from './types';
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
import { SignOverlay } from '@app/screens/Action/SignOverlay';
import { WcSignOverlay } from '@app/screens/Action/WcSignOverlay';
import { useOverlay } from '@polkadot-live/ui/contexts';
import { renderToast } from '@polkadot-live/ui/utils';
import { generateUID } from '@ren/utils/AccountUtils';
import { WalletConnectModal } from '@walletconnect/modal';
import { ChainIcon } from '@polkadot-live/ui/components';

const PAGINATION_ITEMS_PER_PAGE = 10;

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
   * Instantiate WalletConnect modal when component mounts.
   */
  useEffect(() => {
    if (!wcModal.current) {
      const modal = new WalletConnectModal({
        enableExplorer: false,
        explorerRecommendedWalletIds: 'NONE',
        explorerExcludedWalletIds: 'ALL',
        projectId: wc.WC_PROJECT_ID,
      });

      wcModal.current = modal;
    }
  }, []);

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
   * Fetch stored extrinsics when window loads.
   */
  useEffect(() => {
    const fetchExtrinsics = async () => {
      const ser = ((await window.myAPI.sendExtrinsicsTaskAsync({
        action: 'extrinsics:getAll',
        data: null,
      })) || '[]') as string;

      // Parse the array and dynamic data.
      const parsedA: ExtrinsicInfo[] = JSON.parse(ser);
      const parsedB = parsedA.map((info) => {
        parseExtrinsicData(info.actionMeta);
        return info;
      });

      // Set status to `submitted-unknown` if app was closed before tx was finalized.
      for (const info of parsedB) {
        if (info.txStatus === 'submitted' || info.txStatus === 'in_block') {
          info.txStatus = 'submitted-unknown';

          await window.myAPI.sendExtrinsicsTaskAsync({
            action: 'extrinsics:update',
            data: {
              serialized: JSON.stringify({ ...info, dynamicInfo: undefined }),
            },
          });
        }

        // Cache data in extrinsics ref.
        extrinsicsRef.current.set(info.txId, { ...info });
      }

      // Trigger cache flag to update addresses state.
      setUpdateCache(true);
    };
    fetchExtrinsics();
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
      // Relay building extrinsic flag to app.
      window.myAPI.relaySharedState('isBuildingExtrinsic', false);
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
      const info = extrinsicsRef.current.get(txId);
      if (!info) {
        throw new Error('Error: Extrinsic not found.');
      }

      ConfigAction.portAction.postMessage({
        task: 'renderer:tx:init',
        data: JSON.stringify(info),
      });
    } catch (err) {
      window.myAPI.relaySharedState('isBuildingExtrinsic', false);
      console.log(err);
    }
  };

  /**
   * Sets an extrinsic's estimated fee received from the main renderer.
   */
  const setEstimatedFee = async (txId: string, estimatedFee: string) => {
    try {
      const info = extrinsicsRef.current.get(txId);
      if (!info) {
        throw new Error('Error: Extrinsic not found.');
      }

      info.estimatedFee = estimatedFee;
      setUpdateCache(true);

      // Persist extrinsic to store.
      await window.myAPI.sendExtrinsicsTaskAsync({
        action: 'extrinsics:persist',
        data: { serialized: JSON.stringify(info) },
      });

      renderToast(
        'Extrinsic added.',
        `toast-added-${String(Date.now())}`,
        'success'
      );
    } catch (err) {
      console.log(err);
    } finally {
      // Relay building extrinsic flag to app.
      window.myAPI.relaySharedState('isBuildingExtrinsic', false);
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
        throw new Error('Error: Extrinsic not found.');
      }

      // Relay building extrinsic flag to app.
      window.myAPI.relaySharedState('isBuildingExtrinsic', true);

      ConfigAction.portAction.postMessage({
        task: 'renderer:tx:build',
        data: JSON.stringify(info),
      });
    } catch (err) {
      console.log(err);
    }
  };

  const getOverlayComponent = (info: ExtrinsicInfo) => {
    switch (info.actionMeta.source) {
      case 'vault':
        return <SignOverlay txId={info.txId} from={info.actionMeta.from} />;
      case 'wallet-connect':
        return <WcSignOverlay info={info} />;
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
        throw new Error('Error: Extrinsic not found.');
      }

      info.dynamicInfo = dynamicInfo;
      setUpdateCache(true);

      // Open sign overlay.
      openOverlayWith(getOverlayComponent(info), 'small', true);
    } catch (err) {
      console.log(err);
    } finally {
      window.myAPI.relaySharedState('isBuildingExtrinsic', false);
    }
  };

  /**
   * Render an error notification if an extrinsic is not valid for submission.
   */
  const notifyInvalidExtrinsic = (message: string) => {
    window.myAPI.relaySharedState('isBuildingExtrinsic', false);
    const text = `Invalid extrinsic - ${message}`;
    renderToast(text, `invalid-extrinsic-${String(Date.now())}`, 'error');
  };

  /**
   * Send a completed and signed extrinsic to main renderer for submission.
   */
  const submitTx = (txId: string) => {
    window.myAPI.relaySharedState('isBuildingExtrinsic', true);

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
      window.myAPI.relaySharedState('isBuildingExtrinsic', false);
    }
  };

  /**
   * Submit a mock extrinsic.
   */
  const submitMockTx = (txId: string) => {
    window.myAPI.relaySharedState('isBuildingExtrinsic', true);

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
  const updateTxStatus = async (txId: string, txStatus: TxStatus) => {
    try {
      const info = extrinsicsRef.current.get(txId);
      if (!info) {
        throw new Error('Error: Extrinsic not found.');
      }

      info.txStatus = txStatus;
      setUpdateCache(true);

      if (txStatus === 'error' || txStatus === 'finalized') {
        window.myAPI.relaySharedState('isBuildingExtrinsic', false);
      }

      // Update tx status in store.
      const sendInfo: ExtrinsicInfo = { ...info, dynamicInfo: undefined };
      await window.myAPI.sendExtrinsicsTaskAsync({
        action: 'extrinsics:update',
        data: { serialized: JSON.stringify(sendInfo) },
      });
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
  const removeExtrinsic = async (info: ExtrinsicInfo) => {
    const { txId } = info;
    const fromAddress = info.actionMeta.from;

    if (extrinsicsRef.current.delete(txId)) {
      // Remove cached transaction in main process.
      ConfigAction.portAction.postMessage({
        task: 'renderer:tx:delete',
        data: { txId },
      });

      // Remove extrinsic from store.
      await window.myAPI.sendExtrinsicsTaskAsync({
        action: 'extrinsics:remove',
        data: { txId },
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
  const updateAccountName = async (address: string, accountName: string) => {
    // Update extrinsics state in actionMeta.
    for (const [txId, info] of Array.from(extrinsicsRef.current.entries())) {
      let updateStore = false;

      if (info.actionMeta.action === 'balances_transferKeepAlive') {
        // Check signer and recipient account names.
        const data: ExTransferKeepAliveData = info.actionMeta.data;
        const updateSigner = info.actionMeta.from === address;
        const updateRecipient = data.recipientAddress === address;

        if (updateSigner) {
          info.actionMeta.accountName = accountName;
        }
        if (updateRecipient) {
          info.actionMeta.data.recipientAccountName = accountName;
        }
        if (updateSigner || updateRecipient) {
          extrinsicsRef.current.set(txId, { ...info });
          updateStore = true;
        }
      } else if (info.actionMeta.from === address) {
        // Update signer account name.
        info.actionMeta.accountName = accountName;
        extrinsicsRef.current.set(txId, { ...info });
        updateStore = true;
      }

      // Update data in store.
      if (updateStore) {
        await window.myAPI.sendExtrinsicsTaskAsync({
          action: 'extrinsics:update',
          data: { serialized: JSON.stringify(info) },
        });
      }
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

  return (
    <TxMetaContext.Provider
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
        setTxSignature,
        submitMockTx,
        submitTx,
        updateAccountName,
        updateTxStatus,
      }}
    >
      {children}
    </TxMetaContext.Provider>
  );
};
