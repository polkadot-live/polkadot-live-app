// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ChainID } from '@/types/chains';
import { BrowserWindow } from 'electron';

// A window helper to manage which windows are open and their current state.
type StoredWindow = {
  window: BrowserWindow;
  id: string;
  focused: boolean;
};

export class WindowsController {
  // The currently active (showing) windows.
  static active: StoredWindow[] = [];

  static all = () => this.active;

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

  // Gets a browser window from the `active` set via its id.
  static get = (id: string) => {
    return (
      this.active.find((a: StoredWindow) => a.id === id)?.window ?? undefined
    );
  };

  // A window is in focus.
  static focus = (id: string) => {
    this.active = this.active.map((a: StoredWindow) =>
      a.id === id ? { ...a, focused: true } : a
    );
  };

  // A window has been blurred.
  static blur = (id: string) => {
    this.active = this.active.map((a: StoredWindow) =>
      a.id === id ? { ...a, focused: false } : a
    );
  };

  // At least one window is in focus.
  static focused = () => {
    return this.active.find((a: StoredWindow) => a.focused) ? true : false;
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
  static show = (id: string) => {
    for (const { window, id: currId } of this.active) {
      if (currId === id) {
        window.show();
        this.focus(id);
        break;
      }
    }
  };

  // Close window of a id and remove from active.
  static close = (id: string) => {
    for (const { window, id: currId } of this.active) {
      if (currId !== id) continue;

      if (id === 'menu') {
        window.hide();
      } else {
        window.close();
        this.remove(id);
      }

      break;
    }
  };

  // Hide all windows if app is in focus.
  static hideAll = () => {
    if (!this.focused()) {
      return;
    }

    // Close all non-menubar windows.
    this.all().forEach((storedWindow) => {
      if (storedWindow.id !== 'menu') storedWindow.window.hide();
    });
  };

  // Report an event to all open windows.
  static reportAll = (chain: ChainID, event: string) => {
    for (const { id } of this.active) {
      this.get(id)?.webContents?.send(event, chain);
    }
  };
}
