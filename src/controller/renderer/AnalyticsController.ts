// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '@/types/misc';

export class AnalyticsController {
  /// Send umami event.
  static umamiTrack(event: string, data?: AnyData) {
    if (window.umami !== undefined) {
      data !== undefined
        ? window.umami.track(event, data)
        : window.umami.track(event);
    }
  }

  /// Disable umami analytics.
  static disableUmami() {
    localStorage.setItem('umami.disabled', String(1));
  }

  /// Enable umami analytics if it's currently disabled.
  static enableUmami() {
    localStorage.removeItem('umami.disabled');
  }
}
