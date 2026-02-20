// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getDefaultSettings } from '@polkadot-live/consts/settings';
import { WindowsController } from '../controller';
import { SettingsRepository } from '../db';
import { hideDockIcon, showDockIcon } from '../utils/SystemUtils';
import * as WindowUtils from '../utils/WindowUtils';
import type { IpcTask } from '@polkadot-live/types/communication';
import type { SettingKey } from '@polkadot-live/types/settings';

export class SettingsController {
  // In-memory settings cache.
  private static settingsCache = getDefaultSettings();

  // ===== Initialize  =====

  static initialize = () => {
    const defaults = getDefaultSettings();
    const persisted = SettingsRepository.getAll();

    for (const [key, defaultValue] of defaults.entries()) {
      if (persisted.has(key)) {
        this.settingsCache.set(key, persisted.get(key)!);
      } else {
        // Insert any new setting keys that were not in the database yet.
        SettingsRepository.set(key, defaultValue);
        this.settingsCache.set(key, defaultValue);
      }
    }
  };

  // ===== Process IPC Tasks =====

  static process(task: IpcTask) {
    switch (task.action) {
      case 'settings:handle': {
        const { key, val }: { key: SettingKey; val: boolean } = task.data;
        SettingsController.set(key, val);
        SettingsController.handle(key, val);
        break;
      }
    }
  }

  private static handle = (key: SettingKey, val: boolean) => {
    switch (key) {
      case 'setting:docked-window': {
        WindowUtils.handleNewDockFlag(val);
        break;
      }
      case 'setting:show-all-workspaces': {
        this.toggleAllWorkspaces();
        break;
      }
      case 'setting:hide-dock-icon': {
        const hide = this.settingsCache.get('setting:hide-dock-icon')!;
        hide ? hideDockIcon() : showDockIcon();
        break;
      }
    }
  };

  // ===== Public =====

  // Get a cached value.
  static get = (key: SettingKey): boolean =>
    Boolean(this.settingsCache.get(key));

  // Return cache as serialized.
  static getAppSettings = () =>
    JSON.stringify(Array.from(this.settingsCache.entries()));

  // Enable or disable showing the app on all workspaces (macos and linux).
  private static toggleAllWorkspaces() {
    if (!['darwin', 'linux'].includes(process.platform)) {
      return;
    }

    WindowsController.setVisibleOnAllWorkspaces(
      Boolean(
        SettingsController.settingsCache.get('setting:show-all-workspaces'),
      ),
    );

    // Re-hide dock if we're on macOS.
    // Electron will show the dock icon after calling the workspaces API.
    const hideDock = Boolean(
      SettingsController.settingsCache.get('setting:hide-dock-icon'),
    );
    hideDock && hideDockIcon();
  }

  // Set a cached value.
  static set = (key: SettingKey, value: boolean) => {
    this.settingsCache.set(key, value);
    SettingsRepository.set(key, value);
  };
}
