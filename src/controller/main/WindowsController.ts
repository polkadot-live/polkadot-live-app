// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { store } from '@/main';
import type { AnyJson } from '@/types/misc';
import type { BaseWindow, BrowserWindow, WebContentsView } from 'electron';
import type { ChainID } from '@/types/chains';

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
    this.views = this.views.filter((a: StoredView) => a.id !== id);
  };

  // Check if view is already created.
  static viewExists = (viewId: string): boolean =>
    this.views.find(({ id }) => id === viewId) ? true : false;

  // Render a managed view inside the base window.
  static renderView = (viewId: string) => {
    const { view } = this.views.find(({ id }) => id === viewId)!;
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
  static initViewBounds = (view: WebContentsView) => {
    const Y_OFFSET = 60;
    const { width, height } = this.base!.window.getContentBounds()!;

    view.setBounds({
      x: 0,
      y: 60,
      width,
      height: Math.max(height - Y_OFFSET, 0),
    });
  };

  // Resize views when base window resized.
  static resizeViews = () => {
    const Y_OFFSET = 60;
    const { width, height } = this.base!.window.getContentBounds()!;

    this.tabsView?.setBounds({ x: 0, y: 0, width, height: Y_OFFSET });

    const children = this.base!.window.contentView.children;
    for (const child of children) {
      if (child !== this.tabsView) {
        child.setBounds({
          x: 0,
          y: Y_OFFSET,
          width,
          height: Math.max(height - Y_OFFSET, 0),
        });
      }
    }
  };

  /* ---------------------------------------- */
  /* Stored Windows                           */
  /* ---------------------------------------- */

  static all = () => this.active;

  // Adds a view to the `active` set.
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

  // Gets a browser window from the `active` set via its id.
  static get = (id: string) =>
    this.active.find((a: StoredWindow) => a.id === id)?.window ?? undefined;

  // A window is in focus.
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
  static blur = (id: string) => {
    if (this.base && id === 'base') {
      this.base = { ...this.base, focused: false };
    } else if (id !== 'base') {
      this.active = this.active.map((a: StoredWindow) =>
        a.id === id ? { ...a, focused: false } : a
      );
    }
  };

  // At least one window is in focus.
  static focused = () =>
    this.active.find((a: StoredWindow) => a.focused) ? true : false;

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
  static show = (id: string) => {
    const window = this.active.find((w) => w.id === id)?.window;
    if (window) {
      window.show();
      this.focus(id);
    }
  };

  // Close window of a id and remove from active.
  static close = (id: string) => {
    if (this.base && id === 'base') {
      this.base.window.hide();
    } else if (id !== 'base') {
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

  // Hide all windows if app is in focus.
  static hideAll = () => {
    if (!this.focused()) {
      return;
    }

    // Close all non-menubar windows.
    this.all().forEach((storedWindow) => {
      if (storedWindow.id !== 'menu') {
        storedWindow.window.hide();
      }
    });
  };

  // Report an event to all open windows.
  static reportAll = (chain: ChainID, event: string) => {
    for (const { id } of this.active) {
      this.get(id)?.webContents?.send(event, chain);
    }
  };

  // Toggle a window's visibility.
  static toggleVisible = (id: string) => {
    const window = this.get(id);

    // TODO: Apply to base window.

    if (!window) {
      throw new Error(
        `WindowsController.toggleVisible - Window not found with id: ${id}`
      );
    }

    window.isVisible() ? this.hideAndBlur(id) : this.show(id);
  };

  // Handle the main window's bounds.
  static persistMenuBounds = () => {
    const mainWindow = this.get('menu');

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
    const mainWindow = this.get('menu');
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

    // TODO: Apply setting to base window.
  };
}
