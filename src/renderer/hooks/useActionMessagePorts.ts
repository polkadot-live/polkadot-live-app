// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigAction } from '@/config/processes/action';
import { useEffect } from 'react';
import { useTxMeta } from '@/renderer/contexts/action/TxMeta';
import type { ActionMeta } from '@/types/tx';

export const useActionMessagePorts = () => {
  /// Action window specific.
  const {
    setActionMeta,
    setEstimatedFee,
    setTxId,
    setTxPayload,
    setGenesisHash,
    setTxStatus,
  } = useTxMeta();

  /**
   * @name handleInitAction
   * @summary Set initial state for the action window.
   */
  const handleInitAction = (ev: MessageEvent) => {
    const data: ActionMeta = JSON.parse(ev.data.data);
    console.log(data);
    setActionMeta(data);
  };

  /**
   * @name handleTxReportData
   * @summary Set tx data in actions window sent from extrinsics controller.
   */
  const handleTxReportData = (ev: MessageEvent) => {
    const { estimatedFee, txId, payload, genesisHash } = ev.data.data;

    setEstimatedFee(estimatedFee);
    setTxId(txId);
    setTxPayload(txId, payload);
    setGenesisHash(genesisHash);
  };

  /**
   * @name handleSetTxStatus
   * @summary Update the transaction status.
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
