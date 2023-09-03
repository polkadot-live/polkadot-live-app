// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AnyJson, AnyWindow } from '@polkadotlive/types';
import { ChainID } from '@polkadot-live/types/chains';

// A window helper to manage which windows are open and their current state.
/* {
  w: BrowserWindow,
  id: string,
  focused: boolean
}
*/
export class Windows {
  // The currently active (showing) windows.
  static active: AnyJson = [];

  // Adds a window to `active`.
  static add = (w: AnyWindow, id: string) => {
    if (this.active.find((a: AnyJson) => a.id === id)) {
      this.active = this.active.filter((a: AnyJson) => a.id !== id);
    }
    this.active.push({
      w,
      id,
      focused: false,
    });
  };

  // Removes a window from `active` via id.
  static remove = (id: string) => {
    this.active = this.active.filter((a: AnyJson) => a.id !== id);
  };

  // Gets a window from `active` via id.
  static get = (id: string) => {
    return this.active.find((a: AnyJson) => a.id === id)?.w ?? undefined;
  };

  static all = () => this.active;

  // A window is in focus.
  static focus = (id: string) => {
    this.active = this.active.map((a: AnyJson) =>
      a.id === id
        ? {
            ...a,
            focused: true,
          }
        : a
    );
  };

  // A window has been blurred.
  static blur = (id: string) => {
    this.active = this.active.map((a: AnyJson) =>
      a.id === id
        ? {
            ...a,
            focused: false,
          }
        : a
    );
  };

  // At least one window is in focus.
  static focused = () => {
    return this.active.find((a: AnyJson) => a.focused) ? true : false;
  };

  // Hide window of a id and remove focus.
  static hideAndBlur = (id: string) => {
    const window = this.active.find((a: AnyJson) => a.id === id);
    if (window) {
      window.w.hide();
      this.blur(id);
    }
  };

  // Close window of a id and remove from active.
  static close = (id: string) => {
    const window = this.active.find((a: AnyJson) => a.id === id);
    if (window && window.id !== 'menu') {
      window.w.close();
      this.remove(id);
    } else {
      window.w.hide();
    }
  };

  // Hide all windows if app is in focus.
  static hideAll = () => {
    if (!this.focused()) {
      return;
    }
    // Close all non-menubar windows.
    this.all().forEach((win: AnyWindow) => {
      try {
        if (win.id !== 'menu') {
          win.w.hide();
        } else {
          win.w.hideWindow();
        }
      } catch (e) {
        if (win.id !== 'menu') {
          this.remove(win.id);
        }
      }
    });
  };

  // Report an event to all open windows.
  static reportAll = (chain: ChainID, event: string) => {
    for (const { id } of this.active) {
      this.get(id)?.webContents?.send(event, chain);
    }
  };
}
