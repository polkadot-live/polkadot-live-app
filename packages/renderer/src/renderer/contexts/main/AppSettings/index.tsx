// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as RendererConfig } from '@ren/config/processes/renderer';
import { createContext, useContext, useEffect, useState } from 'react';
import { defaultAppSettingsContext } from './defaults';
import type { AppSettingsContextInterface } from './types';
import type { SettingAction } from '@polkadot-live/types/settings';

export const AppSettingsContext = createContext<AppSettingsContextInterface>(
  defaultAppSettingsContext
);

export const useAppSettings = () => useContext(AppSettingsContext);

export const AppSettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /// Dock toggled.
  const [dockToggled, setDockToggled] = useState<boolean>(true);

  /// Silence notifications.
  const [silenceOsNotifications, setSilenceOsNotifications] =
    useState<boolean>(false);

  /// Show debugging subscriptions.
  const [showDebuggingSubscriptions, setShowDebuggingSubscriptions] =
    useState<boolean>(false);

  /// Enable automatic subscriptions.
  const [enableAutomaticSubscriptions, setEnableAutomaticSubscriptions] =
    useState<boolean>(true);

  /// Enable Polkassembly API.
  const [enablePolkassemblyApi, setEnablePolkassemblyApi] =
    useState<boolean>(true);

  /// Hide dock icon.
  const [hideDockIcon, setHideDockIcon] = useState<boolean>(false);

  /// Side nav collapsed flag.
  const [sideNavCollapsed, setSideNavCollapsed] = useState<boolean>(false);

  /// Get settings from main and initialise state.
  useEffect(() => {
    const initSettings = async () => {
      const {
        appDocked,
        appSilenceOsNotifications,
        appShowDebuggingSubscriptions,
        appEnableAutomaticSubscriptions,
        appEnablePolkassemblyApi,
        appKeepOutdatedEvents,
        appHideDockIcon,
        appCollapseSideNav,
      } = await window.myAPI.getAppSettings();

      // Set cached notifications flag in renderer config.
      RendererConfig.silenceNotifications = appSilenceOsNotifications;
      RendererConfig.showDebuggingSubscriptions = appShowDebuggingSubscriptions;
      RendererConfig.enableAutomaticSubscriptions =
        appEnableAutomaticSubscriptions;
      RendererConfig.keepOutdatedEvents = appKeepOutdatedEvents;

      // Set settings state.
      setDockToggled(appDocked);
      setSilenceOsNotifications(appSilenceOsNotifications);
      setShowDebuggingSubscriptions(appShowDebuggingSubscriptions);
      setEnableAutomaticSubscriptions(appEnableAutomaticSubscriptions);
      setEnablePolkassemblyApi(appEnablePolkassemblyApi);
      setHideDockIcon(appHideDockIcon);
      setSideNavCollapsed(appCollapseSideNav);
    };

    initSettings();
  }, []);

  /// Handle toggling a setting.
  const handleToggleSetting = (settingAction: SettingAction) => {
    window.myAPI.sendSettingTask({
      action: 'settings:toggle',
      data: { settingAction },
    });
  };

  /// Handle toggling the docked window state.
  const handleDockedToggle = () => {
    setDockToggled((prev) => {
      const docked = !prev;

      window.myAPI.sendSettingTask({
        action: 'settings:set:docked',
        data: { flag: docked },
      });

      return docked;
    });
  };

  /// Handle toggling native OS notifications from main renderer UI.
  const handleToggleSilenceOsNotifications = () => {
    setSilenceOsNotifications((prev) => {
      const newFlag = !prev;
      RendererConfig.silenceNotifications = newFlag;
      return newFlag;
    });

    handleToggleSetting('settings:execute:silenceOsNotifications');
  };

  /// Handle toggling show debugging subscriptions.
  const handleToggleShowDebuggingSubscriptions = () => {
    setShowDebuggingSubscriptions((prev) => {
      const newFlag = !prev;
      RendererConfig.showDebuggingSubscriptions = newFlag;
      return newFlag;
    });

    handleToggleSetting('settings:execute:showDebuggingSubscriptions');
  };

  /// Handle toggling enable automatic subscriptions.
  const handleToggleEnableAutomaticSubscriptions = () => {
    setEnableAutomaticSubscriptions((prev) => {
      const newFlag = !prev;
      RendererConfig.enableAutomaticSubscriptions = newFlag;
      return newFlag;
    });

    handleToggleSetting('settings:execute:enableAutomaticSubscriptions');
  };

  /// Handle toggling enable Polkassembly API.
  const handleToggleEnablePolkassemblyApi = () => {
    setEnablePolkassemblyApi(!enablePolkassemblyApi);
    handleToggleSetting('settings:execute:enablePolkassembly');
  };

  /// Handle toggling keep outdated events setting.
  const handleToggleKeepOutdatedEvents = () => {
    const newFlag = !RendererConfig.keepOutdatedEvents;
    RendererConfig.keepOutdatedEvents = newFlag;
    handleToggleSetting('settings:execute:keepOutdatedEvents');
  };

  /// Handle toggling hide dock icon setting.
  const handleToggleHideDockIcon = () => {
    setHideDockIcon(!hideDockIcon);
    handleToggleSetting('settings:execute:hideDockIcon');
  };

  /// Handle collapse/expand side nav.
  const handleSideNavCollapse = () => {
    setSideNavCollapsed((pv) => !pv);
    handleToggleSetting('settings:execute:collapseSideNav');
  };

  return (
    <AppSettingsContext.Provider
      value={{
        dockToggled,
        silenceOsNotifications,
        showDebuggingSubscriptions,
        enableAutomaticSubscriptions,
        enablePolkassemblyApi,
        hideDockIcon,
        sideNavCollapsed,
        setSilenceOsNotifications,
        handleDockedToggle,
        handleToggleSilenceOsNotifications,
        handleToggleShowDebuggingSubscriptions,
        handleToggleEnableAutomaticSubscriptions,
        handleToggleEnablePolkassemblyApi,
        handleToggleKeepOutdatedEvents,
        handleToggleHideDockIcon,
        handleSideNavCollapse,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};