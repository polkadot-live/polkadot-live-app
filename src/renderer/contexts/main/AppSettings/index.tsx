// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as RendererConfig } from '@/config/processes/renderer';
import { createContext, useContext, useEffect, useState } from 'react';
import { defaultAppSettingsContext } from './defaults';
import type { AppSettingsContextInterface } from './types';

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

  // Get settings from main and initialise state.
  useEffect(() => {
    const initSettings = async () => {
      const {
        appDocked,
        appSilenceOsNotifications,
        appShowDebuggingSubscriptions,
      } = await window.myAPI.getAppSettings();

      // Set cached notifications flag in renderer config.
      RendererConfig.silenceNotifications = appSilenceOsNotifications;
      RendererConfig.showDebuggingSubscriptions = appShowDebuggingSubscriptions;

      // Set settings state.
      setDockToggled(appDocked);
      setSilenceOsNotifications(appSilenceOsNotifications);
      setShowDebuggingSubscriptions(appShowDebuggingSubscriptions);
    };

    initSettings();
  }, []);

  /// Handle toggling the docked window state.
  const handleDockedToggle = () => {
    setDockToggled((prev) => {
      const docked = !prev;
      window.myAPI.setDockedFlag(docked);
      return docked;
    });
  };

  /// Handle toggling native OS notifications.
  const handleToggleSilenceOsNotifications = () => {
    setSilenceOsNotifications((prev) => {
      const newFlag = !prev;
      RendererConfig.silenceNotifications = newFlag;
      return newFlag;
    });

    window.myAPI.toggleSetting('settings:execute:silenceOsNotifications');
  };

  /// Handle toggling show debugging subscriptions.
  const handleToggleShowDebuggingSubscriptions = () => {
    setShowDebuggingSubscriptions((prev) => {
      const newFlag = !prev;
      RendererConfig.showDebuggingSubscriptions = newFlag;
      return newFlag;
    });

    window.myAPI.toggleSetting('settings:execute:showDebuggingSubscriptions');
  };

  return (
    <AppSettingsContext.Provider
      value={{
        dockToggled,
        silenceOsNotifications,
        showDebuggingSubscriptions,
        handleDockedToggle,
        handleToggleSilenceOsNotifications,
        handleToggleShowDebuggingSubscriptions,
        setSilenceOsNotifications,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};
