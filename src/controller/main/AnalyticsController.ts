// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { address as ipAddress } from 'ip';
import { Umami } from '@/model/Umami';
import type { AnyData } from '@/types/misc';

export class AnalyticsController {
  private static umami: Umami | null = null;
  private static enabled = false;

  /**
   * @name initUmami
   * @summary Initialize umami analytics instance.
   */
  static initUmami(agent: string, windowId: string, language: string) {
    if (process.env.DISABLE_ANALYTICS !== undefined) {
      this.enabled = false;
      return;
    }

    this.umami = new Umami(ipAddress(), agent, language);
    this.enabled = true;
    this.umami.view(`/${windowId}`, { data: {} });
  }

  /**
   * @name umamiTrack
   * @summary Send an umami tracking event.
   */
  static async umamiTrack(event: string, data?: AnyData) {
    if (!this.enabled || !this.umami) {
      return;
    }

    this.umami.event(event, { data: data ? data : {} });
  }
}
