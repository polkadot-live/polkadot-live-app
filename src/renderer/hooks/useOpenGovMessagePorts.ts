// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigOpenGov } from '@/config/processes/openGov';
import { useEffect } from 'react';
import { getTracks } from '@/model/Track';
import { useTracks } from '@app/contexts/openGov/Tracks';
import type { AnyData } from '@/types/misc';

export const useOpenGovMessagePorts = () => {
  const { setTracks, setFetchingTracks } = useTracks();

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
            case 'openGov:tracks:receive': {
              setTracks(getTracks(ev.data.data.result));
              setFetchingTracks(false);
              break;
            }
            case 'openGov:referenda:receive': {
              const { json } = ev.data.data;
              const map: Map<string, AnyData[]> = JSON.parse(json);
              console.log(map);
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
