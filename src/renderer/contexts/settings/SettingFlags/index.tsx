// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useState } from 'react';
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

  /// Determine if a swtich is on or off.
  const getSwitchState = (setting: SettingItem) => {
    const { action } = setting;

    switch (action) {
      case 'settings:execute:dockedWindow': {
        return windowDocked;
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
      default: {
        break;
      }
    }
  };

  return (
    <SettingFlagsContext.Provider
      value={{
        windowDocked,
        setWindowDocked,
        getSwitchState,
        handleSwitchToggle,
      }}
    >
      {children}
    </SettingFlagsContext.Provider>
  );
};
