// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config } from '@/config/processes/main';
import { hideDockIcon, showDockIcon } from '@/utils/SystemUtils';
import { store } from '@/main';
import { WindowsController } from '@/controller/main/WindowsController';
import * as WindowUtils from '@/utils/WindowUtils';
import type { AnyData } from '@/types/misc';
import type { IpcTask } from '@/types/communication';
import type {
  PersistedSettings,
  SettingAction,
} from '@/renderer/screens/Settings/types';

export class SettingsController {
  /**
   * @name getAppSettings
   * @summary Return the application settings structure, initialize if necessary.
   */
  static getAppSettings(): PersistedSettings {
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
        appCollapseSideNav: false,
      };

      // Persist default settings to store and return them.
      (store as Record<string, AnyData>).set(key, settings);
      return settings;
    }
  }

  /**
   * @name process
   * @summary Process a one-way ipc task.
   */
  static process(task: IpcTask) {
    switch (task.action) {
      case 'settings:set:docked': {
        WindowUtils.handleNewDockFlag(task.data.flag);
        break;
      }
      case 'settings:toggle:allWorkspaces': {
        this.toggleAllWorkspaces();
        break;
      }
      case 'settings:toggle': {
        this.toggleSetting(task.data.settingAction as SettingAction);
        break;
      }
    }
  }

  /**
   * @name toggleAllWorkspaces
   * @summary Enable or disable showing the app on all workspaces (macos and linux).
   */
  private static toggleAllWorkspaces() {
    if (!['darwin', 'linux'].includes(process.platform)) {
      return;
    }

    // Get new flag.
    const settings = this.getAppSettings();
    const flag = !settings.appShowOnAllWorkspaces;

    // Update windows.
    settings.appShowOnAllWorkspaces = flag;
    WindowsController.setVisibleOnAllWorkspaces(flag);

    // Update storage.
    const key = Config.settingsStorageKey;
    (store as Record<string, AnyData>).set(key, settings);

    // Re-hide dock if we're on macOS.
    // Electron will show the dock icon after calling the workspaces API.
    settings.appHideDockIcon && hideDockIcon();
  }

  /**
   * @name toggleSetting
   * @summary Toggle an application setting and persist new setting to store.
   */
  private static toggleSetting(settingAction: SettingAction) {
    const settings = this.getAppSettings();

    switch (settingAction) {
      case 'settings:execute:showDebuggingSubscriptions': {
        const flag = !settings.appShowDebuggingSubscriptions;
        settings.appShowDebuggingSubscriptions = flag;
        break;
      }
      case 'settings:execute:silenceOsNotifications': {
        const flag = !settings.appSilenceOsNotifications;
        settings.appSilenceOsNotifications = flag;
        break;
      }
      case 'settings:execute:enableAutomaticSubscriptions': {
        const flag = !settings.appEnableAutomaticSubscriptions;
        settings.appEnableAutomaticSubscriptions = flag;
        break;
      }
      case 'settings:execute:enablePolkassembly': {
        const flag = !settings.appEnablePolkassemblyApi;
        settings.appEnablePolkassemblyApi = flag;
        break;
      }
      case 'settings:execute:keepOutdatedEvents': {
        const flag = !settings.appKeepOutdatedEvents;
        settings.appKeepOutdatedEvents = flag;
        break;
      }
      case 'settings:execute:hideDockIcon': {
        const flag = !settings.appHideDockIcon;
        settings.appHideDockIcon = flag;

        // Hide or show dock icon.
        flag ? hideDockIcon() : showDockIcon();
        break;
      }
      case 'settings:execute:collapseSideNav': {
        const flag = !settings.appCollapseSideNav;
        settings.appCollapseSideNav = flag;
        break;
      }
      default: {
        break;
      }
    }

    const key = Config.settingsStorageKey;
    (store as Record<string, AnyData>).set(key, settings);
  }
}
