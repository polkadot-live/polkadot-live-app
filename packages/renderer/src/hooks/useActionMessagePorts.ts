// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigAction } from '@polkadot-live/core';
import { useEffect } from 'react';
import {
  useConnections,
  useLedgerFeedback,
  useWcFeedback,
} from '@polkadot-live/contexts';
import { useTxMeta, useWcVerifier } from '@ren/contexts/action';
import { useOverlay } from '@polkadot-live/ui/contexts';
import { renderToast } from '@polkadot-live/ui/utils';
import type { ActionMeta, TxStatus } from '@polkadot-live/types/tx';
import type { ChainID } from '@polkadot-live/types/chains';
import type { LedgerErrorMeta } from '@polkadot-live/types/ledger';
import type { WalletConnectMeta } from '@polkadot-live/types/walletConnect';

export const useActionMessagePorts = () => {
  /**
   * Action window specific.
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
   * @name handleInitAction
   * @summary Receives an event's action metadata and instantiates a new extrinsic structure.
   */
  const handleInitAction = (ev: MessageEvent) => {
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
      case 'main-action:action': {
        ConfigAction.portAction = e.ports[0];

        ConfigAction.portAction.onmessage = async (ev: MessageEvent) => {
          // Message received from `main`.
          switch (ev.data.task) {
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
            default: {
              throw new Error(`Port task not recognized (${ev.data.task})`);
            }
          }
        };

        ConfigAction.portAction.start();
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
