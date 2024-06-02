// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigOpenGov } from '@/config/processes/openGov';
import { getTracks } from '../utils/openGovUtils';
import { useConnections } from '../contexts/common/Connections';
import { useEffect } from 'react';
import { useTracks } from '@app/contexts/openGov/Tracks';
import { useReferenda } from '../contexts/openGov/Referenda';
import { useTreasury } from '../contexts/openGov/Treasury';
import { useReferendaSubscriptions } from '../contexts/openGov/ReferendaSubscriptions';
import type { ActiveReferendaInfo } from '@/types/openGov';
import type { IntervalSubscription } from '@/types/subscriptions';

export const useOpenGovMessagePorts = () => {
  const { setIsConnected } = useConnections();
  const { setTracks, setFetchingTracks } = useTracks();
  const { setReferenda, setFetchingReferenda } = useReferenda();
  const { setTreasuryData } = useTreasury();
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

        ConfigOpenGov.portOpenGov.onmessage = (ev: MessageEvent) => {
          // Message received from `main`.
          switch (ev.data.task) {
            case 'openGov:connection:status': {
              const { status } = ev.data.data;
              setIsConnected(status);
              break;
            }
            case 'openGov:tracks:receive': {
              setTracks(getTracks(ev.data.data.result));
              setFetchingTracks(false);
              break;
            }
            case 'openGov:referenda:receive': {
              const { json } = ev.data.data;
              const parsed: ActiveReferendaInfo[] = JSON.parse(json);

              setReferenda(parsed);
              setFetchingReferenda(false);
              break;
            }
            case 'openGov:treasury:set': {
              setTreasuryData(ev.data.data);
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
