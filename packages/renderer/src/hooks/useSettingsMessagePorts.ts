// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigSettings } from '@polkadot-live/core';

/// Settings window contexts.
import { useEffect } from 'react';
import { useSettingFlags } from '@ren/contexts/settings/SettingFlags';

export const useSettingsMessagePorts = () => {
  const { setWindowDocked, setSilenceOsNotifications, renderToastify } =
    useSettingFlags();

  /**
   * @name handleReceivedPort
   * @summary Handle messages sent to the settings window.
   */
  const handleReceivedPort = (e: MessageEvent) => {
    console.log(`received port: ${e.data.target}`);

    switch (e.data.target) {
      case 'main-settings:settings': {
        ConfigSettings.portSettings = e.ports[0];

        ConfigSettings.portSettings.onmessage = (ev: MessageEvent) => {
          // Message received from `main`.
          switch (ev.data.task) {
            case 'settings:set:dockedWindow': {
              const { docked } = ev.data.data;
              setWindowDocked(docked);
              break;
            }
            case 'settings:set:silenceOsNotifications': {
              const { silenced } = ev.data.data;
              setSilenceOsNotifications(silenced);
              break;
            }
            case 'settings:render:toast': {
              const { success, text } = ev.data.data;
              renderToastify(success, text);
              break;
            }
            default: {
              throw new Error(`Port task not recognized (${ev.data.task})`);
            }
          }
        };

        ConfigSettings.portSettings.start();
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
