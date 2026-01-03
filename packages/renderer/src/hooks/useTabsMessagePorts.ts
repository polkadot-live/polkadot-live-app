// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigTabs, getTracks } from '@polkadot-live/core';
import { useEffect } from 'react';
import { useWalletConnectImport } from '../contexts/import';
import {
  useAccountStatuses,
  useConnections,
  useImportAddresses,
  useImportHandler,
  useLedgerFeedback,
  useOverlay,
  useReferenda,
  useReferendaSubscriptions,
  useRemoveHandler,
  useSettingFlags,
  useTabs,
  useTracks,
  useTreasury,
  useWcFeedback,
} from '@polkadot-live/contexts';
import { useTxMeta, useWcVerifier } from '../contexts/action';
import { renderToast } from '@polkadot-live/ui';
import type { ActionMeta, TxStatus } from '@polkadot-live/types/tx';
import type { ChainID } from '@polkadot-live/types/chains';
import type { LedgerErrorMeta } from '@polkadot-live/types/ledger';
import type {
  WalletConnectMeta,
  WcFetchedAddress,
} from '@polkadot-live/types/walletConnect';
import type {
  AccountSource,
  EncodedAccount,
  ImportedGenericAccount,
  IntervalSubscription,
  ReferendaInfo,
  SerializedTrackItem,
  TabData,
} from '@polkadot-live/types';

export const useTabsMessagePorts = () => {
  const { addTab, tabsData } = useTabs();

  /**
   * Action view specific.
   */
  const {
    handleOpenCloseWcModal,
    importExtrinsics,
    initTx,
    notifyInvalidExtrinsic,
    setEstimatedFee,
    setTxDynamicInfo,
    updateAccountName,
    setTxHash,
    updateTxStatus,
  } = useTxMeta();

  const { relayState } = useConnections();
  const { resolveMessage, setIsSigning } = useLedgerFeedback();
  const { resolveMessage: resolveWcMessage, clearFeedback } = useWcFeedback();
  const { setDisableClose, setStatus: setOverlayStatus } = useOverlay();
  const { setWcAccountApproved, setWcAccountVerifying } = useWcVerifier();

  /**
   * Import view specific.
   */
  const { handleImportAddressFromBackup } = useImportHandler();
  const { setStatusForAccount } = useAccountStatuses();
  const { handleAddressImport } = useImportAddresses();
  const { handleRemoveAddress } = useRemoveHandler();
  const { setWcFetchedAddresses, handleOpenCloseWcModal: onOpenCloseWcModal } =
    useWalletConnectImport();

  /**
   * OpenGov view specific.
   */
  const { receiveTracksData, setFetchingTracks } = useTracks();
  const { receiveReferendaData, setFetchingReferenda } = useReferenda();
  const { setTreasuryData, setFetchingTreasuryData } = useTreasury();
  const { addReferendaSubscription, updateReferendaSubscription, removeRef } =
    useReferendaSubscriptions();

  /**
   * Settings view specific.
   */
  const { cacheSet } = useSettingFlags();

  /**
   * @name handleInitAction
   * @summary Receives an event's action metadata and instantiates a new extrinsic structure.
   */
  const handleInitAction = (ev: MessageEvent) => {
    // Make sure `extrinsics` tab is open.
    if (!tabsData.find(({ viewId }) => viewId === 'action')) {
      addTab({ id: -1, viewId: 'action', label: 'Extrinsics' });
    }
    const data: ActionMeta = JSON.parse(ev.data.data);
    initTx(data);
  };

  /**
   * @name handleTxImport
   * @summary Import extrinsics data from a backup file.
   */
  const handleTxImport = (ev: MessageEvent) => {
    const { serialized } = ev.data.data;
    importExtrinsics(serialized);
  };

  /**
   * @name handleAccountRename
   * @summary Update extrinsics and address state to reflect an updated account name.
   */
  const handleAccountRename = async (ev: MessageEvent) => {
    interface Target {
      address: string;
      chainId: ChainID;
      newName: string;
    }
    const { address, chainId, newName }: Target = ev.data.data;
    await updateAccountName(address, chainId, newName);
  };

  /**
   * @name handleSetEstimatedFee
   * @summary Set an extrinsic's estimated fee received from the main renderer.
   */
  const handleSetEstimatedFee = async (ev: MessageEvent) => {
    interface Target {
      txId: string;
      estimatedFee: string;
    }
    const { txId, estimatedFee }: Target = ev.data.data;
    await setEstimatedFee(txId, estimatedFee);
  };

  /**
   * @name handleTxReportData
   * @summary Set tx data in actions window sent from extrinsics controller.
   */
  const handleTxReportData = (ev: MessageEvent) => {
    interface Target {
      accountNonce: number;
      genesisHash: `0x${string}`;
      txId: string;
      txPayload: Uint8Array;
    }
    const { accountNonce, genesisHash, txId, txPayload }: Target = ev.data.data;

    setTxDynamicInfo(txId, {
      accountNonce: String(accountNonce),
      genesisHash,
      txPayload,
    });
    console.log(`> Dynamic info and nonce set (${accountNonce})`);
  };

  /**
   * @name handleSetTxStatus
   * @summary Update the status for a transaction.
   */
  const handleSetTxStatus = async (ev: MessageEvent) => {
    const { txId, status }: { txId: string; status: TxStatus } = ev.data.data;

    // Handle transaction hash.
    if ((['finalized', 'error'] as TxStatus[]).includes(status)) {
      relayState('extrinsic:building', false);
    }
    if (status === 'finalized') {
      const { txHash }: { txHash: `0x${string}` } = ev.data.data;
      setTxHash(txId, txHash);
    }
    // Also updates store with transaction hash.
    await updateTxStatus(txId, status);
  };

  /**
   * @name handleInvalidExtrinsic
   * @summary Render an error message if an extrinsic is invalid.
   */
  const handleInvalidExtrinsic = (ev: MessageEvent) => {
    const { message }: { message: string } = ev.data.data;
    notifyInvalidExtrinsic(message);
  };

  /**
   * @name handleReceivedPort
   * @summary Handle messages sent to the action window..
   */
  const handleReceivedPort = async (e: MessageEvent) => {
    console.log(`received port: ${e.data.target}`);

    switch (e.data.target) {
      case 'main-tabs:tabs': {
        ConfigTabs.portToMain = e.ports[0];

        ConfigTabs.portToMain.onmessage = async (ev: MessageEvent) => {
          // Message received from `main`.
          switch (ev.data.task) {
            /**
             * Tabs view.
             */
            case 'tabs:addTab': {
              const { tabData }: { tabData: TabData } = ev.data.data;
              addTab(tabData);
              break;
            }
            /**
             * Extrinsics view.
             */
            case 'action:init': {
              handleInitAction(ev);
              break;
            }
            case 'action:ledger:error': {
              const errorMeta: LedgerErrorMeta = JSON.parse(ev.data.data);
              setIsSigning(false);
              resolveMessage(errorMeta);
              break;
            }
            case 'action:tx:import': {
              handleTxImport(ev);
              break;
            }
            case 'action:tx:report:data': {
              handleTxReportData(ev);
              break;
            }
            case 'action:tx:report:status': {
              await handleSetTxStatus(ev);
              break;
            }
            case 'action:account:rename': {
              await handleAccountRename(ev);
              break;
            }
            case 'action:tx:setEstimatedFee': {
              await handleSetEstimatedFee(ev);
              break;
            }
            case 'action:tx:invalid': {
              handleInvalidExtrinsic(ev);
              break;
            }
            case 'action:wc:approve': {
              const { approved }: { approved: boolean } = ev.data.data;
              setWcAccountApproved(approved);
              setWcAccountVerifying(false);
              approved && clearFeedback();
              break;
            }
            case 'action:wc:error': {
              const feedback: WalletConnectMeta = ev.data.data;
              resolveWcMessage(feedback);
              break;
            }
            case 'action:wc:modal:close': {
              handleOpenCloseWcModal(false);
              break;
            }
            case 'action:wc:modal:open': {
              const { uri } = ev.data.data;
              await handleOpenCloseWcModal(true, uri);
              break;
            }
            case 'action:overlay:close': {
              setDisableClose(false);
              setOverlayStatus(0);
              break;
            }
            case 'action:toast:show': {
              const { message, toastId, toastType } = ev.data.data;
              renderToast(message, toastId, toastType);
              break;
            }
            /**
             * Accounts view.
             */
            case 'import:account:add': {
              // Import an address from a backup file.
              const { json }: { json: string } = ev.data.data;
              const genericAccount: ImportedGenericAccount = JSON.parse(json);
              await handleImportAddressFromBackup(genericAccount);
              break;
            }
            case 'import:account:processing': {
              const { serEncodedAccount: en, serGenericAccount: ge } =
                ev.data.data;

              const generic: ImportedGenericAccount = JSON.parse(ge);
              const encoded: EncodedAccount = JSON.parse(en);
              const { address, chainId } = encoded;

              interface I {
                source: AccountSource;
                status: boolean;
                success: boolean;
              }
              const { status, success }: I = ev.data.data;
              setStatusForAccount(
                `${chainId}:${address}`,
                generic.source,
                status
              );

              if (!success) {
                await handleRemoveAddress(encoded, generic);
                renderToast('Account import error', 'import-error', 'error');
              }
              break;
            }
            case 'import:address:update': {
              // Update state for an address.
              const { genericAccount } = ev.data.data;
              handleAddressImport(genericAccount);
              break;
            }
            case 'import:wc:modal:open': {
              const { uri } = ev.data.data;
              await onOpenCloseWcModal(true, uri);
              break;
            }
            case 'import:wc:modal:close': {
              onOpenCloseWcModal(false);
              break;
            }
            case 'import:wc:set:fetchedAddresses': {
              const parsed: WcFetchedAddress[] = JSON.parse(
                ev.data.data.fetchedAddresses
              );
              setWcFetchedAddresses(parsed);
              break;
            }
            case 'import:toast:show': {
              const { message, toastId, toastType } = ev.data.data;
              renderToast(message, toastId, toastType);
              break;
            }
            /**
             * OpenGov view.
             */
            case 'openGov:tracks:receive': {
              interface Target {
                serialized: SerializedTrackItem[] | null;
                chainId: ChainID;
              }
              const { serialized, chainId }: Target = ev.data.data;

              if (serialized !== null) {
                receiveTracksData(getTracks(serialized), chainId);
              } else {
                // TODO: UI error notification.
                setFetchingTracks(false);
              }
              break;
            }
            case 'openGov:referenda:receive': {
              const { json } = ev.data.data;

              if (json !== null) {
                const parsed: ReferendaInfo[] = JSON.parse(json);
                await receiveReferendaData(parsed);
              } else {
                setFetchingReferenda(false);
                renderToast('Error fetching referenda', 'fetch-error', 'error');
              }
              break;
            }
            case 'openGov:treasury:set': {
              if (ev.data.data !== null) {
                setTreasuryData(ev.data.data);
              } else {
                setFetchingTreasuryData(false);
                renderToast('Error fetching treasury', 'fetch-error', 'error');
              }
              break;
            }
            case 'openGov:task:add': {
              const { serialized } = ev.data.data;
              const task: IntervalSubscription = JSON.parse(serialized);
              addReferendaSubscription(task);
              break;
            }
            case 'openGov:task:update': {
              const { serialized } = ev.data.data;
              const task: IntervalSubscription = JSON.parse(serialized);
              updateReferendaSubscription(task);
              break;
            }
            case 'openGov:ref:remove': {
              const { chainId, refId } = ev.data.data;
              removeRef(chainId, refId);
              break;
            }
            /**
             * Settings view.
             */
            case 'settings:set:dockedWindow': {
              const { docked } = ev.data.data;
              cacheSet('setting:docked-window', docked);
              break;
            }
            case 'settings:set:silenceOsNotifications': {
              const { silenced } = ev.data.data;
              cacheSet('setting:silence-os-notifications', silenced);
              break;
            }
            case 'settings:render:toast': {
              const { success, text } = ev.data.data;
              const toastId = `toast-export-data-${success}`;
              renderToast(text, toastId, 'success');
              break;
            }
            default: {
              throw new Error(`Port task not recognized (${ev.data.task})`);
            }
          }
        };
        ConfigTabs.portToMain.start();
        break;
      }
      default: {
        console.error('Something went wrong.');
        break;
      }
    }
  };

  useEffect(() => {
    /**
     * Provide `onmessage` function.
     */
    window.onmessage = handleReceivedPort;

    /**
     * Cleanup message listener.
     */
    return () => {
      window.removeEventListener('message', handleReceivedPort, false);
    };
  }, []);
};
