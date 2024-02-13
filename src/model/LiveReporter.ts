// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { MainDebug } from '@/utils/DebugUtils';
import { NotificationsController } from '@/controller/NotificationsController';
import type { Report, Reporter } from '@/types/reporter';

const debug = MainDebug.extend('LiveReporter');

// The reporter to be used for the notification service.
export class LiveReporter implements Reporter {
  constructor() {
    debug(`📺 New Live reporter`);
  }

  async report(report: Report): Promise<void> {
    if (report._type === 'notification') {
      // Show notification if account is concrete account.
      // TODO: support callback, and if is present, do not fire event - allow callback to do so.
      for (const { account, pallet, method } of report.details) {
        if (account !== 'Wildcard') {
          const clipped = account.nickname;
          NotificationsController.chainNotification(clipped, pallet, method);
        }
      }

      const { delegators, chain } = report;
      debug.extend(chain)('👔 Delegators to report: ', delegators);

      for (const d of delegators) {
        // TODO: expand callbacks to be on a per event `pallet_method` basis.
        const { delegator, callback } = d;

        if (callback === 'unclaimed_rewards') {
          // Temporary log.
          //PolkadotCallbacks.unclaimedPoolRewards(delegator);
          console.log(delegator);
        }
      }
      // console log the report.
      debug.extend(chain)('📈 %o', report);
    }

    return Promise.resolve();
  }
}
