// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { BrowserWindow } from 'electron';
import { WindowStateRepository } from '../db';
import type { SyncID } from '@polkadot-live/types/communication';
import type { BaseWindow, WebContentsView } from 'electron';

// A window helper to manage which windows are open and their current state.
interface StoredWindow {
  window: BrowserWindow;
  id: string;
  focused: boolean;
}

interface StoredBase {
  window: BaseWindow;
  id: string;
  focused: boolean;
}

export class WindowsController {
  // Managed windows.
  static active: StoredWindow[] = [];
  static base: StoredBase | null = null;
  static tabsView: WebContentsView | null = null;
  private static overlay: BrowserWindow | null = null;

  // Height of tabs view in pixels (tabs height + header height)
  static Y_OFFSET = 49 + 35.0938;

  // Gets a browser window from the `active` set via its id.
  static getWindow = (id: string) =>
    this.active.find((a: StoredWindow) => a.id === id)?.window ?? undefined;

  static minimizeWindow = (windowId: string) => {
    windowId === 'main'
      ? this.getWindow('menu')?.minimize()
      : this.base?.window.minimize();
  };

  /* ---------------------------------------- */
  /* Messaging                                */
  /* ---------------------------------------- */

  static relaySharedState = (
    channel: string,
    ipcData: { syncId: SyncID; state: boolean | string },
    includeTabs = true,
    includeMain = true,
  ) => {
    // Send to main window.
    if (includeMain) {
      this.getWindow('menu')?.webContents?.send(channel, ipcData);
    }
    // Send to tabs view.
    if (includeTabs) {
      this.tabsView?.webContents.send(channel, ipcData);
    }
  };

  static setWindowsBackgroundColor = (color: string) => {
    this.getWindow('menu')?.setBackgroundColor(color);
    this.base?.window.setBackgroundColor(color);
    this.tabsView?.setBackgroundColor(color);
  };

  /* ---------------------------------------- */
  /* Overlay Window                           */
  /* ---------------------------------------- */

  static setBaseAlwaysOnTop = (alwaysOnTop: boolean) => {
    this.base?.window.setAlwaysOnTop(alwaysOnTop);
  };

  static overlayExists = (): boolean => this.overlay !== null;

  static getOverlay = (): BrowserWindow | null => {
    const window = this.base?.window;
    if (!window) {
      return null;
    }
    const { x, y, width, height } = window.getBounds();
    const overlay = new BrowserWindow({
      alwaysOnTop: true,
      frame: false,
      show: true,
      x,
      y,
      width,
      height,
      resizable: false,
      minimizable: false,
      maximizable: false,
      closable: true,
      fullscreenable: false,
      skipTaskbar: true,
      backgroundColor: '#2b2b2b',
      opacity: 0.25,
    });

    overlay.on('move', () => {
      const [xPos, yPos] = WindowsController.overlay!.getPosition();
      WindowsController.base?.window.setPosition(xPos, yPos, false);
    });

    this.overlay = overlay;
    return this.overlay;
  };

  static destroyOverlay = () => {
    this.overlay?.close();
    this.overlay = null;
  };

  /* ---------------------------------------- */
  /* Base Window                              */
  /* ---------------------------------------- */

  static setBaseWindow = (window: BaseWindow) => {
    this.base = { window, id: 'base', focused: false };
  };

  static setTabsView = (view: WebContentsView) => {
    this.tabsView = view;
  };

  /* ---------------------------------------- */
  /* Tabs                                     */
  /* ---------------------------------------- */

  static addTab = (viewId: string) => {
    const Labels: Record<string, string> = {
      action: 'Extrinsics',
      import: 'Accounts',
      openGov: 'OpenGov',
      settings: 'Settings',
    };
    const channel = 'renderer:tab:open';
    const label = Labels[viewId];
    this.tabsView?.webContents.send(channel, { id: -1, label, viewId });
  };

  /* ---------------------------------------- */
  /* Stored Views                             */
  /* ---------------------------------------- */

  // Resize base window.
  static resizeBaseWindow = (size: 'small' | 'medium' | 'large' | '') => {
    const Bounds: Record<string, { width: number; height: number }> = {
      small: { width: 400, height: 750 },
      medium: { width: 900, height: 550 },
      large: { width: 1200, height: 700 },
      default: { width: 400, height: 300 },
    };
    const { width, height } = Bounds[size === '' ? 'default' : size];
    this.base?.window.setSize(width, height);
    this.resizeViews();
  };

  // Resize views when base window resized.
  static resizeViews = () => {
    const { width, height } = this.base!.window.getContentBounds()!;
    this.tabsView?.setBounds({ x: 0, y: 0, width, height });
  };

  // Open a view's devTools if in DEBUG mode.
  static openDevTools = (viewId: string) => {
    if (!process.env.DEBUG) {
      return;
    }
    if (viewId === 'tabs') {
      this.tabsView?.webContents.openDevTools();
    }
  };

  /* ---------------------------------------- */
  /* Stored Windows                           */
  /* ---------------------------------------- */

  // A window is in focus.
  static focus = (id: string) => {
    if (id === 'base' && this.base) {
      this.base = { ...this.base, focused: true };
    } else if (id !== 'base') {
      this.active = this.active.map((a: StoredWindow) =>
        a.id === id ? { ...a, focused: true } : a,
      );
    }
  };

  // A window has been blurred.
  static blur = (id: string) => {
    if (this.base && id === 'base') {
      this.base = { ...this.base, focused: false };
    } else if (id !== 'base') {
      this.active = this.active.map((a: StoredWindow) =>
        a.id === id ? { ...a, focused: false } : a,
      );
    }
  };

  // Adds a window to the `active` set.
  static add = (window: BrowserWindow, id: string) => {
    const newWindow: StoredWindow = { window, id, focused: false };
    this.active = this.active.reduceRight(
      (acc, curr) => {
        if (curr.id !== id) {
          acc.unshift(curr);
        }
        return acc;
      },
      [newWindow],
    );
  };

  // Removes a window from the `active` set via its id.
  static remove = (id: string) => {
    this.active = this.active.filter((a: StoredWindow) => a.id !== id);
  };

  // Hide window of a id and remove focus.
  static hideAndBlur = (id: string) => {
    for (const { window, id: currId } of this.active) {
      if (currId === id) {
        window.hide();
        this.blur(id);
        break;
      }
    }
  };

  // Show a window
  // TODO: Remove or refactor to `showView`.
  static show = (id: string) => {
    if (id === 'base' && this.base?.window) {
      const window = this.base.window;
      !window.isVisible() ? window.show() : window.focus();
    } else if (id !== 'base') {
      const window = this.active.find((w) => w.id === id)?.window;
      if (window) {
        window.show();
        this.focus(id);
      }
    }
  };

  // Close window of a id and remove from active.
  static close = (id: string) => {
    if (this.base && id === 'tabs') {
      this.base.window.hide();
    } else if (id !== 'tabs') {
      for (const { window, id: currId } of this.active) {
        if (currId !== id) {
          continue;
        }
        if (id === 'menu') {
          window.hide();
        } else {
          window.close();
          this.remove(id);
        }
        break;
      }
    }
  };

  // Toggle a managed window's visibility.
  static toggleWindowVisible = (id: string) => {
    const window = this.getWindow(id);
    if (!window) {
      throw new Error(
        `WindowsController.toggleWindowVisible - Window not found with id: ${id}`,
      );
    }
    window.isVisible() ? this.hideAndBlur(id) : this.show(id);
  };

  // Handle the main window's bounds.
  static persistMenuBounds = () => {
    const mainWindow = this.getWindow('menu');
    if (!mainWindow) {
      throw new Error(
        `WindowsController.handleMenuBounds - Main window doesn't exist`,
      );
    }
    if (mainWindow.isFocused()) {
      WindowStateRepository.set('menu', mainWindow.getBounds());
    }
  };

  // Move main window to menu bounds persisted in the store.
  static moveToMenuBounds = () => {
    const mainWindow = this.getWindow('menu');
    if (!mainWindow) {
      throw new Error(
        `WindowsController.moveToMenuBounds - Main window doesn't exist`,
      );
    }
    const storeMenuPos = WindowStateRepository.get('menu');
    if (storeMenuPos?.x && storeMenuPos?.y) {
      mainWindow.setPosition(storeMenuPos.x, storeMenuPos.y, false);
    }
  };

  // Set workspaces flag on all active windows.
  static setVisibleOnAllWorkspaces = (flag: boolean) => {
    for (const { window } of this.active) {
      window.setVisibleOnAllWorkspaces(flag);
    }
    // Apply setting to base window.
    this.base?.window.setVisibleOnAllWorkspaces(flag);
  };
}
