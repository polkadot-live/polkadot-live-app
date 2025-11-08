// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from 'packages/types/src';

export class BusDispatcher {
  private static bus: EventTarget;

  static init = (bus: EventTarget) => {
    this.bus = bus;
  };

  static dispatch = (name: string, detail: AnyData) => {
    if (!this.bus) {
      throw new Error('BusDispatcher not initialized.');
    }
    this.bus.dispatchEvent(new CustomEvent(name, { detail }));
  };
}
