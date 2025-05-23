// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useEffect, useState } from 'react';
import { Flip, toast } from 'react-toastify';
import type { SettingFlagsContextInterface } from './types';
import type { SettingItem } from '@polkadot-live/types/settings';

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
  const [silenceOsNotifications, setSilenceOsNotifications] = useState(false);
  const [
    silenceExtrinsicsOsNotifications,
    setSilenceExtrinsicsOsNotifications,
  ] = useState(false);
  const [showOnAllWorkspaces, setShowOnAllWorkspaces] = useState(false);
  const [showDebuggingSubscriptions, setShowDebuggingSubscriptions] =
    useState(false);
  const [enableAutomaticSubscriptions, setEnableAutomaticSubscriptions] =
    useState(true);
  const [enablePolkassemblyApi, setEnablePolkassemblyApi] = useState(true);
  const [keepOutdatedEvents, setKeepOutdatedEvents] = useState(true);
  const [hideDockIcon, setHideDockIcon] = useState(false);

  /// Fetch settings from store and set state.
  useEffect(() => {
    const initSettings = async () => {
      const {
        appDocked,
        appSilenceOsNotifications,
        appSilenceExtrinsicsOsNotifications,
        appShowOnAllWorkspaces,
        appShowDebuggingSubscriptions,
        appEnableAutomaticSubscriptions,
        appEnablePolkassemblyApi,
        appKeepOutdatedEvents,
        appHideDockIcon,
      } = await window.myAPI.getAppSettings();

      setWindowDocked(appDocked);
      setSilenceOsNotifications(appSilenceOsNotifications);
      setSilenceExtrinsicsOsNotifications(appSilenceExtrinsicsOsNotifications);
      setShowOnAllWorkspaces(appShowOnAllWorkspaces);
      setShowDebuggingSubscriptions(appShowDebuggingSubscriptions);
      setEnableAutomaticSubscriptions(appEnableAutomaticSubscriptions);
      setEnablePolkassemblyApi(appEnablePolkassemblyApi);
      setKeepOutdatedEvents(appKeepOutdatedEvents);
      setHideDockIcon(appHideDockIcon);
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
      case 'settings:execute:silenceExtrinsicsOsNotifications': {
        return silenceExtrinsicsOsNotifications;
      }
      case 'settings:execute:showOnAllWorkspaces': {
        return showOnAllWorkspaces;
      }
      case 'settings:execute:showDebuggingSubscriptions': {
        return showDebuggingSubscriptions;
      }
      case 'settings:execute:enableAutomaticSubscriptions': {
        return enableAutomaticSubscriptions;
      }
      case 'settings:execute:enablePolkassembly': {
        return enablePolkassemblyApi;
      }
      case 'settings:execute:keepOutdatedEvents': {
        return keepOutdatedEvents;
      }
      case 'settings:execute:hideDockIcon': {
        return hideDockIcon;
      }
      default: {
        return true;
      }
    }
  };

  /// Handle toggling a setting switch.
  const handleSwitchToggle = (setting: SettingItem) => {
    const { action } = setting;
    let umamiData = { settingId: '', toggledOn: false };

    switch (action) {
      case 'settings:execute:dockedWindow': {
        umamiData = { settingId: 'dock-window', toggledOn: !windowDocked };
        setWindowDocked(!windowDocked);
        break;
      }
      case 'settings:execute:silenceOsNotifications': {
        umamiData = {
          settingId: 'silence-notifications',
          toggledOn: !silenceOsNotifications,
        };
        setSilenceOsNotifications(!silenceOsNotifications);
        break;
      }
      case 'settings:execute:silenceExtrinsicsOsNotifications': {
        umamiData = {
          settingId: 'silence-extrinsics-notifications',
          toggledOn: !silenceExtrinsicsOsNotifications,
        };
        setSilenceExtrinsicsOsNotifications(!silenceExtrinsicsOsNotifications);
        break;
      }
      case 'settings:execute:showOnAllWorkspaces': {
        umamiData = {
          settingId: 'all-workspaces',
          toggledOn: !showOnAllWorkspaces,
        };
        setShowOnAllWorkspaces(!showOnAllWorkspaces);
        break;
      }
      case 'settings:execute:showDebuggingSubscriptions': {
        umamiData = {
          settingId: 'debugging-subscriptions',
          toggledOn: !showDebuggingSubscriptions,
        };
        setShowDebuggingSubscriptions(!showDebuggingSubscriptions);
        break;
      }
      case 'settings:execute:enableAutomaticSubscriptions': {
        umamiData = {
          settingId: 'automatic-subscriptions',
          toggledOn: !enableAutomaticSubscriptions,
        };
        setEnableAutomaticSubscriptions(!enableAutomaticSubscriptions);
        break;
      }
      case 'settings:execute:enablePolkassembly': {
        umamiData = {
          settingId: 'polkassembly-api',
          toggledOn: !enablePolkassemblyApi,
        };
        setEnablePolkassemblyApi(!enablePolkassemblyApi);
        break;
      }
      case 'settings:execute:keepOutdatedEvents': {
        umamiData = {
          settingId: 'outdated-events',
          toggledOn: !keepOutdatedEvents,
        };
        setKeepOutdatedEvents(!keepOutdatedEvents);
        break;
      }
      case 'settings:execute:hideDockIcon': {
        umamiData = { settingId: 'hide-dock-icon', toggledOn: !hideDockIcon };
        setHideDockIcon(!hideDockIcon);
        break;
      }
      default: {
        break;
      }
    }

    const { settingId, toggledOn } = umamiData;
    const event = `setting-toggle-${toggledOn ? 'on' : 'off'}`;
    window.myAPI.umamiEvent(event, { setting: settingId });
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
        closeOnClick: true,
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
        closeOnClick: true,
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
