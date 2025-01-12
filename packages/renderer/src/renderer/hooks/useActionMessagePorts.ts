// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigAction } from '@ren/config/processes/action';
import { useEffect } from 'react';
import { useTxMeta } from '@app/contexts/action/TxMeta';
import type { ActionMeta, TxStatus } from '@polkadot-live/types/tx';

export const useActionMessagePorts = () => {
  /// Action window specific.
  const { initTx, setTxDynamicInfo, setTxStatus } = useTxMeta();

  /**
   * @name handleInitAction
   * @summary Receives an event's action metadata and instantiates a new extrinsic structure.
   */
  const handleInitAction = (ev: MessageEvent) => {
    const data: ActionMeta = JSON.parse(ev.data.data);
    initTx(data);
  };

  /**
   * @name handleTxReportData
   * @summary Set tx data in actions window sent from extrinsics controller.
   */
  const handleTxReportData = (ev: MessageEvent) => {
    const { txId, txPayload, estimatedFee, genesisHash, accountNonce } =
      ev.data.data;
    const txStatus: TxStatus = 'pending';

    setTxDynamicInfo(txId, {
      accountNonce,
      estimatedFee,
      genesisHash,
      txPayload,
      txStatus,
    });

    console.log(`> Dynamic info and nonce set (${accountNonce})`);
  };

  /**
   * @name handleSetTxStatus
   * @summary Update the transaction status.
   *
   * @todo Refactor into new system.
   */
  const handleSetTxStatus = (ev: MessageEvent) => {
    const { status } = ev.data.data;

    setTxStatus(status);
  };

  /**
   * @name handleReceivedPort
   * @summary Handle messages sent to the action window..
   */
  const handleReceivedPort = (e: MessageEvent) => {
    console.log(`received port: ${e.data.target}`);

    switch (e.data.target) {
      case 'main-action:action': {
        ConfigAction.portAction = e.ports[0];

        ConfigAction.portAction.onmessage = async (ev: MessageEvent) => {
          // Message received from `main`.
          switch (ev.data.task) {
            case 'action:init': {
              console.log('> handle action:init');
              handleInitAction(ev);
              break;
            }
            case 'action:tx:report:data': {
              console.log('> handle action:tx:report:data');
              handleTxReportData(ev);
              break;
            }
            case 'action:tx:report:status': {
              console.log('> handle action:tx:report:status');
              handleSetTxStatus(ev);
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
