// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Umami } from '../model/Umami';
import type { AnyData } from '@polkadot-live/types/misc';

export class AnalyticsController {
  private static umami: Umami | null = null;
  private static enabled = false;

  /**
   * @name initialize
   * @summary Initialize umami analytics instance.
   */
  static initialize(agent: string, windowId: string, language: string) {
    if (process.env.DISABLE_ANALYTICS !== undefined) {
      AnalyticsController.enabled = false;
      return;
    }

    if (!AnalyticsController.umami) {
      AnalyticsController.umami = new Umami(agent, language);
      AnalyticsController.enabled = true;
      windowId !== 'tabs' &&
        AnalyticsController.umami.view(`/${windowId}`, { data: {} });
    }
  }

  /**
   * @name track
   * @summary Send an umami tracking event.
   */
  static async track(event: string, data?: AnyData) {
    if (!AnalyticsController.enabled || !AnalyticsController.umami) {
      return;
    }

    AnalyticsController.umami.event(event, { data: data ? data : {} });
  }
}
