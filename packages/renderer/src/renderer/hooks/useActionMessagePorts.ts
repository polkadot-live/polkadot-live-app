// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigAction } from '@ren/config/processes/action';
import { useEffect } from 'react';
import { useTxMeta } from '@app/contexts/action/TxMeta';
import BigNumber from 'bignumber.js';
import type { ActionMeta } from '@polkadot-live/types/tx';
import type { ChainID } from '@polkadot-live/types/chains';

export const useActionMessagePorts = () => {
  /**
   * Action window specific.
   */
  const {
    initTx,
    setEstimatedFee,
    setTxDynamicInfo,
    updateAccountName,
    updateTxStatus,
  } = useTxMeta();

  /**
   * @name handleInitAction
   * @summary Receives an event's action metadata and instantiates a new extrinsic structure.
   */
  const handleInitAction = (ev: MessageEvent) => {
    const data: ActionMeta = JSON.parse(ev.data.data);
    initTx(data);
  };

  /**
   * @name handleAccountRename
   * @summary Update extrinsics and address state to reflect an updated account name.
   */
  const handleAccountRename = (ev: MessageEvent) => {
    interface Target {
      address: string;
      chainId: ChainID;
      newName: string;
    }

    const { address, newName }: Target = ev.data.data;
    updateAccountName(address, newName);
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
    const { accountNonce, genesisHash, txId, txPayload } = ev.data.data;

    setTxDynamicInfo(txId, {
      accountNonce: new BigNumber(accountNonce),
      genesisHash,
      txPayload,
    });

    console.log(`> Dynamic info and nonce set (${accountNonce})`);
  };

  /**
   * @name handleSetTxStatus
   * @summary Update the status for a transaction.
   */
  const handleSetTxStatus = (ev: MessageEvent) => {
    const { txId, status } = ev.data.data;
    updateTxStatus(txId, status);
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
            case 'action:tx:report:data': {
              handleTxReportData(ev);
              break;
            }
            case 'action:tx:report:status': {
              handleSetTxStatus(ev);
              break;
            }
            case 'action:account:rename': {
              handleAccountRename(ev);
              break;
            }
            case 'action:tx:setEstimatedFee': {
              await handleSetEstimatedFee(ev);
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
