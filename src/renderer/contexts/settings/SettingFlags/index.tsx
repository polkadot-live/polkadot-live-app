// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useEffect, useState } from 'react';
import { Flip, toast } from 'react-toastify';
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
  /// Store state of switch settings.
  const [windowDocked, setWindowDocked] = useState(true);
  const [silenceOsNotifications, setSilenceOsNotifications] = useState(true);
  const [showOnAllWorkspaces, setShowOnAllWorkspaces] = useState(false);
  const [showDebuggingSubscriptions, setShowDebuggingSubscriptions] =
    useState(false);

  /// Fetch settings from store and set state.
  useEffect(() => {
    const initSettings = async () => {
      const {
        appDocked,
        appSilenceOsNotifications,
        appShowOnAllWorkspaces,
        appShowDebuggingSubscriptions,
      } = await window.myAPI.getAppSettings();

      setWindowDocked(appDocked);
      setSilenceOsNotifications(appSilenceOsNotifications);
      setShowOnAllWorkspaces(appShowOnAllWorkspaces);
      setShowDebuggingSubscriptions(appShowDebuggingSubscriptions);
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
      case 'settings:execute:showDebuggingSubscriptions': {
        return showDebuggingSubscriptions;
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
      case 'settings:execute:showDebuggingSubscriptions': {
        setShowDebuggingSubscriptions(!showDebuggingSubscriptions);
        break;
      }
      default: {
        break;
      }
    }
  };

  /// Render a toastify message.
  const renderToastify = (success: boolean, text: string) => {
    const toastId = `toast-export-data-${success}`;
    const position = 'top-center';
    const autoClose = 3000;

    if (success) {
      toast.success(text, {
        position,
        autoClose,
        hideProgressBar: true,
        closeOnClick: false,
        closeButton: false,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: 'dark',
        transition: Flip,
        toastId,
      });
    } else {
      toast.error(text, {
        position,
        autoClose,
        hideProgressBar: true,
        closeOnClick: false,
        closeButton: false,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: 'dark',
        transition: Flip,
        toastId,
      });
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
        renderToastify,
      }}
    >
      {children}
    </SettingFlagsContext.Provider>
  );
};
