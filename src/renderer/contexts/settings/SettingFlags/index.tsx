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

  /// Fetch settings from store and set state.
  useEffect(() => {
    const initSettings = async () => {
      const { appDocked, appSilenceOsNotifications } =
        await window.myAPI.getAppSettings();

      setWindowDocked(appDocked);
      setSilenceOsNotifications(appSilenceOsNotifications);
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
        getSwitchState,
        handleSwitchToggle,
      }}
    >
      {children}
    </SettingFlagsContext.Provider>
  );
};
