// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useEffect, useState } from 'react';
import { Flip, toast } from 'react-toastify';
import type { SettingFlagsContextInterface } from './types';
import type { SettingItem, SettingKey } from '@polkadot-live/types/settings';

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
  const [windowDocked, setWindowDocked] = useState(false);
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
    const sync = async () => {
      const ser = await window.myAPI.getAppSettings();
      const array: [SettingKey, boolean][] = JSON.parse(ser);
      const map = new Map<SettingKey, boolean>(array);

      setWindowDocked(Boolean(map.get('setting:docked-window')));
      setSilenceOsNotifications(
        Boolean(map.get('setting:silence-os-notifications'))
      );
      setSilenceExtrinsicsOsNotifications(
        Boolean(map.get('setting:silence-extrinsic-notifications'))
      );
      setShowOnAllWorkspaces(Boolean(map.get('setting:show-all-workspaces')));
      setShowDebuggingSubscriptions(
        Boolean(map.get('setting:show-debugging-subscriptions'))
      );
      setEnableAutomaticSubscriptions(
        Boolean(map.get('setting:automatic-subscriptions'))
      );
      setEnablePolkassemblyApi(Boolean(map.get('setting:enable-polkassembly')));
      setKeepOutdatedEvents(Boolean(map.get('setting:keep-outdated-events')));
      setHideDockIcon(Boolean(map.get('setting:hide-dock-icon')));
    };

    sync();
  }, []);

  /// Determine if a swtich is on or off.
  const getSwitchState = (setting: SettingItem) => {
    const { key } = setting;

    switch (key) {
      case 'setting:docked-window': {
        return windowDocked;
      }
      case 'setting:silence-os-notifications': {
        return silenceOsNotifications;
      }
      case 'setting:silence-extrinsic-notifications': {
        return silenceExtrinsicsOsNotifications;
      }
      case 'setting:show-all-workspaces': {
        return showOnAllWorkspaces;
      }
      case 'setting:show-debugging-subscriptions': {
        return showDebuggingSubscriptions;
      }
      case 'setting:automatic-subscriptions': {
        return enableAutomaticSubscriptions;
      }
      case 'setting:enable-polkassembly': {
        return enablePolkassemblyApi;
      }
      case 'setting:keep-outdated-events': {
        return keepOutdatedEvents;
      }
      case 'setting:hide-dock-icon': {
        return hideDockIcon;
      }
      default: {
        return true;
      }
    }
  };

  /// Handle toggling a setting switch.
  const handleSwitchToggle = (setting: SettingItem) => {
    const { key } = setting;
    let umamiData = { settingId: '', toggledOn: false };

    switch (key) {
      case 'setting:docked-window': {
        umamiData = { settingId: 'dock-window', toggledOn: !windowDocked };
        setWindowDocked(!windowDocked);
        break;
      }
      case 'setting:silence-os-notifications': {
        umamiData = {
          settingId: 'silence-notifications',
          toggledOn: !silenceOsNotifications,
        };
        setSilenceOsNotifications(!silenceOsNotifications);
        break;
      }
      case 'setting:silence-extrinsic-notifications': {
        umamiData = {
          settingId: 'silence-extrinsics-notifications',
          toggledOn: !silenceExtrinsicsOsNotifications,
        };
        setSilenceExtrinsicsOsNotifications(!silenceExtrinsicsOsNotifications);
        break;
      }
      case 'setting:show-all-workspaces': {
        umamiData = {
          settingId: 'all-workspaces',
          toggledOn: !showOnAllWorkspaces,
        };
        setShowOnAllWorkspaces(!showOnAllWorkspaces);
        break;
      }
      case 'setting:show-debugging-subscriptions': {
        umamiData = {
          settingId: 'debugging-subscriptions',
          toggledOn: !showDebuggingSubscriptions,
        };
        setShowDebuggingSubscriptions(!showDebuggingSubscriptions);
        break;
      }
      case 'setting:automatic-subscriptions': {
        umamiData = {
          settingId: 'automatic-subscriptions',
          toggledOn: !enableAutomaticSubscriptions,
        };
        setEnableAutomaticSubscriptions(!enableAutomaticSubscriptions);
        break;
      }
      case 'setting:enable-polkassembly': {
        umamiData = {
          settingId: 'polkassembly-api',
          toggledOn: !enablePolkassemblyApi,
        };
        setEnablePolkassemblyApi(!enablePolkassemblyApi);
        break;
      }
      case 'setting:keep-outdated-events': {
        umamiData = {
          settingId: 'outdated-events',
          toggledOn: !keepOutdatedEvents,
        };
        setKeepOutdatedEvents(!keepOutdatedEvents);
        break;
      }
      case 'setting:hide-dock-icon': {
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
