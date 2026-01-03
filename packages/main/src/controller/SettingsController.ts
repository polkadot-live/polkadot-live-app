// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { hideDockIcon, showDockIcon } from '../utils/SystemUtils';
import { store } from '../main';
import { WindowsController } from '../controller/WindowsController';
import { getDefaultSettings } from '@polkadot-live/consts/settings';
import * as WindowUtils from '../utils/WindowUtils';
import type { AnyData } from '@polkadot-live/types/misc';
import type { IpcTask } from '@polkadot-live/types/communication';
import type { SettingKey } from '@polkadot-live/types/settings';

export class SettingsController {
  /**
   * In-memory settings cache.
   */
  private static settingsCache = getDefaultSettings();

  /**
   * Initialize settings cache by fetching persisted settings from store.
   */
  static initialize = () => {
    const defaults = getDefaultSettings();

    for (const key of defaults.keys()) {
      if (store.has(key)) {
        const val = (store as Record<string, AnyData>).get(key) as boolean;
        this.settingsCache.set(key, val);
      } else {
        const val = defaults.get(key)!;
        (store as Record<string, AnyData>).set(key, val);
      }
    }
  };

  /**
   * Get a cached value or `false` if it doesn't exist.
   */
  static get = (key: SettingKey): boolean =>
    Boolean(this.settingsCache.get(key));

  /**
   * Set a cached value.
   */
  static set = (key: SettingKey, value: boolean) => {
    this.settingsCache.set(key, value);
    (store as Record<string, AnyData>).set(key, value);
  };

  /**
   * Provide serialized cache to requesting renderer.
   */
  static getAppSettings = () =>
    JSON.stringify(Array.from(this.settingsCache.entries()));

  /**
   * @name process
   * @summary Process a one-way ipc task.
   */
  static process(task: IpcTask) {
    switch (task.action) {
      case 'settings:handle': {
        const { key, val }: { key: SettingKey; val: boolean } = task.data;
        this.set(key, val);
        this.handle(key, val);
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

  /**
   * @name toggleAllWorkspaces
   * @summary Enable or disable showing the app on all workspaces (macos and linux).
   */
  private static toggleAllWorkspaces() {
    if (!['darwin', 'linux'].includes(process.platform)) {
      return;
    }

    const flag = Boolean(this.settingsCache.get('setting:show-all-workspaces'));
    WindowsController.setVisibleOnAllWorkspaces(flag);

    // Re-hide dock if we're on macOS.
    // Electron will show the dock icon after calling the workspaces API.
    const hideDock = Boolean(this.settingsCache.get('setting:hide-dock-icon'));
    hideDock && hideDockIcon();
  }
}
