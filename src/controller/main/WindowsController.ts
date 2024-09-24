// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { store } from '@/main';
import type { AnyJson } from '@/types/misc';
import type { BaseWindow, BrowserWindow, WebContentsView } from 'electron';

// A window helper to manage which windows are open and their current state.
interface StoredWindow {
  window: BrowserWindow;
  id: string;
  focused: boolean;
}

interface StoredView {
  view: WebContentsView;
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
  static views: StoredView[] = [];
  static tabsView: WebContentsView | null = null;

  // Height of tabs view in pixels (tabs height + header height)
  static Y_OFFSET = 49 + 35.0938;

  // Gets a browser window from the `active` set via its id.
  static getWindow = (id: string) =>
    this.active.find((a: StoredWindow) => a.id === id)?.window ?? undefined;

  // Get a managed web contents view.
  static getView = (viewId: string) =>
    this.views.find(({ id }) => viewId === id)?.view ?? undefined;

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
    const getTabLabel = () => {
      switch (viewId) {
        case 'action':
          return 'Extrinsics';
        case 'import':
          return 'Accounts';
        case 'openGov':
          return 'OpenGov';
        case 'settings':
          return 'Settings';
        default:
          return 'Unknown';
      }
    };

    const channel = 'renderer:tab:open';
    const label = getTabLabel();
    this.tabsView?.webContents.send(channel, { id: -1, label, viewId });
  };

  /* ---------------------------------------- */
  /* Stored Views                             */
  /* ---------------------------------------- */

  // Adds a view to the `active` set and append to base window.
  static addView = (view: WebContentsView, id: string) => {
    // TODO: Remove focused field.
    const newWindow: StoredView = { view, id, focused: false };

    this.views = this.views.reduceRight(
      (acc, curr) => (curr.id === id ? acc : [curr, ...acc]),
      [newWindow]
    );

    // Render this view in base window.
    this.renderView(id);
  };

  // Removes a view from the `active` set via its id.
  static removeView = (id: string) => {
    const maybeStoredView = this.views.find((s) => s.id === id);

    if (this.base && maybeStoredView) {
      const { view } = maybeStoredView;
      this.base.window.contentView.removeChildView(view);
      this.views = this.views.filter((s) => s.id !== id);
    }
  };

  // Check if view is already created.
  static viewExists = (viewId: string): boolean =>
    this.views.find(({ id }) => id === viewId) ? true : false;

  // Render a managed view inside the base window.
  static renderView = (viewId: string) => {
    const { view } = this.views.find(({ id }) => id === viewId)!;
    this.initViewBounds(view);

    const children = this.base!.window.contentView.children;
    let added = false;

    for (const child of children) {
      if (child !== this.tabsView) {
        child === view
          ? (added = true)
          : this.base?.window.contentView.removeChildView(child);
      }
    }

    !added && this.base?.window.contentView.addChildView(view);
  };

  // Set view bounds correctly.
  private static initViewBounds = (view: WebContentsView) => {
    const { width, height } = this.base!.window.getContentBounds()!;

    view.setBounds({
      x: 0,
      y: this.Y_OFFSET,
      width,
      height: Math.max(height - this.Y_OFFSET, 0),
    });
  };

  // Resize views when base window resized.
  static resizeViews = () => {
    const { width, height } = this.base!.window.getContentBounds()!;

    this.tabsView?.setBounds({ x: 0, y: 0, width, height: this.Y_OFFSET });

    const children = this.base!.window.contentView.children;
    for (const child of children) {
      if (child !== this.tabsView) {
        child.setBounds({
          x: 0,
          y: this.Y_OFFSET,
          width,
          height: Math.max(height - this.Y_OFFSET, 0),
        });
      }
    }
  };

  /* ---------------------------------------- */
  /* Stored Windows                           */
  /* ---------------------------------------- */

  // A window is in focus.
  // NOTE: Called for `menu` and `base` windows.
  static focus = (id: string) => {
    if (id === 'base' && this.base) {
      this.base = { ...this.base, focused: true };
    } else if (id !== 'base') {
      this.active = this.active.map((a: StoredWindow) =>
        a.id === id ? { ...a, focused: true } : a
      );
    }
  };

  // A window has been blurred.
  // NOTE: Called for `menu` and `base` windows.
  static blur = (id: string) => {
    if (this.base && id === 'base') {
      this.base = { ...this.base, focused: false };
    } else if (id !== 'base') {
      this.active = this.active.map((a: StoredWindow) =>
        a.id === id ? { ...a, focused: false } : a
      );
    }
  };

  // Adds a window to the `active` set.
  static add = (window: BrowserWindow, id: string) => {
    const newWindow: StoredWindow = { window, id, focused: false };

    this.active = this.active.reduceRight(
      (acc, curr) => (curr.id === id ? acc : [curr, ...acc]),
      [newWindow]
    );
  };

  // Removes a window from the `active` set via its id.
  static remove = (id: string) => {
    this.active = this.active.filter((a: StoredWindow) => a.id !== id);
  };

  // Hide window of a id and remove focus.
  // TODO: Refactor to work with `main` or `base` windows.
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
        `WindowsController.toggleWindowVisible - Window not found with id: ${id}`
      );
    }

    window.isVisible() ? this.hideAndBlur(id) : this.show(id);
  };

  // Handle the main window's bounds.
  static persistMenuBounds = () => {
    const mainWindow = this.getWindow('menu');

    if (!mainWindow) {
      throw new Error(
        `WindowsController.handleMenuBounds - Main window doesn't exist`
      );
    }

    if (mainWindow.isFocused()) {
      (store as Record<string, AnyJson>).set(
        'menu_bounds',
        mainWindow.getBounds()
      );
    }
  };

  // Move main window to menu bounds persisted in the store.
  static moveToMenuBounds = () => {
    const mainWindow = this.getWindow('menu');
    if (!mainWindow) {
      throw new Error(
        `WindowsController.moveToMenuBounds - Main window doesn't exist`
      );
    }

    const storeMenuPos: AnyJson = (store as Record<string, AnyJson>).get(
      'menu_bounds'
    );
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
