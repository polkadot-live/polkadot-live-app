// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigOpenGov, getTracks } from '@polkadot-live/core';
import { useTracks } from '@polkadot-live/contexts';
import { useEffect } from 'react';
import {
  useReferenda,
  useReferendaSubscriptions,
  useTreasury,
} from '@ren/contexts/openGov';
import { renderToast } from '@polkadot-live/ui/utils';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  ReferendaInfo,
  SerializedTrackItem,
} from '@polkadot-live/types/openGov';

export const useOpenGovMessagePorts = () => {
  const { receiveTracksData, setFetchingTracks } = useTracks();
  const { receiveReferendaData, setFetchingReferenda } = useReferenda();
  const { setTreasuryData, setFetchingTreasuryData } = useTreasury();

  const {
    addReferendaSubscription,
    updateReferendaSubscription,
    removeReferendaSubscription,
  } = useReferendaSubscriptions();

  /**
   * @name handleReceivedPort
   * @summary Handle messages sent to the settings window.
   */
  const handleReceivedPort = (e: MessageEvent) => {
    console.log(`received port: ${e.data.target}`);

    switch (e.data.target) {
      case 'main-openGov:openGov': {
        ConfigOpenGov.portOpenGov = e.ports[0];

        ConfigOpenGov.portOpenGov.onmessage = async (ev: MessageEvent) => {
          // Message received from `main`.
          switch (ev.data.task) {
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
            case 'openGov:task:removed': {
              const { serialized } = ev.data.data;
              const task: IntervalSubscription = JSON.parse(serialized);
              removeReferendaSubscription({ ...task });
              break;
            }
            default: {
              throw new Error(`Port task not recognized (${ev.data.task})`);
            }
          }
        };

        ConfigOpenGov.portOpenGov.start();
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
