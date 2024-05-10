// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useEffect, useState } from 'react';
import type { SettingFlagsContextInterface } from './types';
import type { SettingItem } from '@/renderer/screens/Settings/types';

export const SettingFlagsContext = createContext<SettingFlagsContextInterface>(
  defaults.defaultSettingFlagsContext
);

export const useSettingFlags = () => useContext(SettingFlagsContext);

export const SettingFlagsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /// Store state of window docked setting.
  const [windowDocked, setWindowDocked] = useState(true);
  const [silenceOsNotifications, setSilenceOsNotifications] = useState(true);
  const [showOnAllWorkspaces, setShowOnAllWorkspaces] = useState(false);

  /// Fetch settings from store and set state.
  useEffect(() => {
    const initSettings = async () => {
      const { appDocked, appSilenceOsNotifications, appShowOnAllWorkspaces } =
        await window.myAPI.getAppSettings();

      setWindowDocked(appDocked);
      setSilenceOsNotifications(appSilenceOsNotifications);
      setShowOnAllWorkspaces(appShowOnAllWorkspaces);
    };

    initSettings();
  }, []);

  /// Determine if a swtich is on or off.
  const getSwitchState = (setting: SettingItem) => {
    const { action } = setting;

    switch (action) {
      case 'settings:execute:dockedWindow': {
        return windowDocked;
      }
      case 'settings:execute:silenceOsNotifications': {
        return silenceOsNotifications;
      }
      case 'settings:execute:showOnAllWorkspaces': {
        return showOnAllWorkspaces;
      }
      default: {
        return true;
      }
    }
  };

  /// Handle toggling a setting switch.
  const handleSwitchToggle = (setting: SettingItem) => {
    const { action } = setting;

    switch (action) {
      case 'settings:execute:dockedWindow': {
        setWindowDocked(!windowDocked);
        break;
      }
      case 'settings:execute:silenceOsNotifications': {
        setSilenceOsNotifications(!silenceOsNotifications);
        break;
      }
      case 'settings:execute:showOnAllWorkspaces': {
        setShowOnAllWorkspaces(!showOnAllWorkspaces);
        break;
      }
      default: {
        break;
      }
    }
  };

  return (
    <SettingFlagsContext.Provider
      value={{
        setWindowDocked,
        setSilenceOsNotifications,
        setShowOnAllWorkspaces,
        getSwitchState,
        handleSwitchToggle,
      }}
    >
      {children}
    </SettingFlagsContext.Provider>
  );
};
