// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Umami } from '@umami/node';
import type { AnyData } from '@/types/misc';

export class AnalyticsController {
  private static websiteId = 'c2062938-358a-4a4a-9f27-ab9d6c0fc4be';
  private static hostUrl = 'https://cloud.umami.is';

  private static enabled = false;
  private static umami: Umami | null = null;

  /**
   * @name initUmami
   * @summary Initialize umami analytics instance.
   */
  static initUmami() {
    if (process.env.DISABLE_ANALYTICS !== undefined) {
      this.enabled = false;
      return;
    }

    try {
      this.umami = new Umami({
        websiteId: this.websiteId,
        hostUrl: this.hostUrl,
      });

      this.enabled = true;
    } catch (e) {
      this.enabled = false;
      console.error(e);
    }
  }

  /**
   * @name umamiTrack
   * @summary Send an umami tracking event.
   */
  static async umamiTrack(event: string, data?: AnyData) {
    if (!this.enabled || !this.umami) {
      return;
    }

    // Response object is returned.
    data === undefined
      ? await this.umami.track(event)
      : await this.umami.track(event, data);
  }
}
