// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js';
import { chainUnits } from '@/config/chains';
import { planckToUnit } from '@w3ux/utils';
import type { Account } from '@/model/Account';
import type { AnyData } from '@/types/misc';
import type { ApiCallEntry } from '@/types/subscriptions';
import type { NotificationData } from '@/types/reporter';

export class NotificationsController {
  /**
   * @name getNotification
   * @summary Return notification data based on the received entry.
   */
  static getNotification(
    entry: ApiCallEntry,
    account: Account,
    miscData?: AnyData
  ): NotificationData {
    switch (entry.task.action) {
      case 'subscribe:account:balance': {
        return {
          title: 'Free Balance',
          body: `Free balance: ${account.balance?.free}`,
        };
      }
      case 'subscribe:account:nominationPools:rewards': {
        return {
          title: 'Unclaimed Nomination Pool Rewards',
          body: `${planckToUnit(
            new BigNumber(miscData.pendingRewardsPlanck.toString()),
            chainUnits(account.chain)
          )}`,
        };
      }
      case 'subscribe:account:nominationPools:state': {
        const { poolState } = account.nominationPoolData!;
        const { prevState } = miscData;

        const body =
          prevState !== poolState
            ? `Changed from ${prevState} to ${poolState}.`
            : `Current state is ${poolState}.`;

        return { title: 'Nomiantion Pool State', body };
      }
      case 'subscribe:account:nominationPools:renamed': {
        const { poolName } = account.nominationPoolData!;
        const { prevName } = miscData;

        const body =
          poolName !== prevName
            ? `Changed from ${prevName} to ${poolName}.`
            : `Current name is ${poolName}.`;

        return {
          title: 'Nomination Pool Name',
          body,
        };
      }
      case 'subscribe:account:nominationPools:roles': {
        const { poolRoles } = account.nominationPoolData!;
        const { poolRoles: prevRoles } = miscData;

        // Add changed roles to an array.
        const changedRoles: string[] = [];

        for (const key in poolRoles) {
          const k = key as keyof typeof poolRoles;
          if (poolRoles[k] !== prevRoles[k]) {
            changedRoles.push(key);
          }
        }

        // Compute the body depending on if roles have changed.
        const body =
          changedRoles.length === 0
            ? 'Roles remain unchanged.'
            : changedRoles.reduce(
                (acc, r) => (acc === '' ? `${acc} ${r}` : `${acc} + ${r}`),
                ''
              ) + ' changed.';

        return {
          title: 'Nomination Pool Roles',
          body,
        };
      }
      default: {
        throw new Error(
          `getNotification: Not implemented for ${entry.task.action}`
        );
      }
    }
  }
}
