// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config } from '@/config/processes/main';
import { store } from '@/main';
import type { AnyData } from '@/types/misc';
import type { PersistedSettings } from '@/renderer/screens/Settings/types';

export class SettingsController {
  /**
   * @name getAppSettings
   * @summary Return the application settings structure, initialize if necessary.
   */
  static getAppSettings = (): PersistedSettings => {
    const key = Config.settingsStorageKey;

    if (store.has(key)) {
      // Return persisted settings.
      return (store as Record<string, AnyData>).get(key);
    } else {
      const settings: PersistedSettings = {
        appDocked: false,
        appSilenceOsNotifications: false,
        appShowOnAllWorkspaces: true,
        appShowDebuggingSubscriptions: false,
        appEnableAutomaticSubscriptions: true,
        appEnablePolkassemblyApi: true,
        appKeepOutdatedEvents: true,
        appHideDockIcon: false,
      };

      // Persist default settings to store and return them.
      (store as Record<string, AnyData>).set(key, settings);
      return settings;
    }
  };
}
