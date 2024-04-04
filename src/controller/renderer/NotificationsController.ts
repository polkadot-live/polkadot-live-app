// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  getFreeBalanceText,
  getNominationPoolCommissionText,
  getNominationPoolRenamedText,
  getNominationPoolRolesText,
  getNominationPoolStateText,
  getPendingRewardsText,
} from '@/utils/EventUtils';
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
          body: getFreeBalanceText(account),
        };
      }
      case 'subscribe:account:nominationPools:rewards': {
        return {
          title: 'Unclaimed Nomination Pool Rewards',
          body: getPendingRewardsText(
            account.chain,
            miscData.pendingRewardsPlanck
          ),
        };
      }
      case 'subscribe:account:nominationPools:state': {
        const { poolState } = account.nominationPoolData!;
        const { prevState } = miscData;

        return {
          title: 'Nomiantion Pool State',
          body: getNominationPoolStateText(poolState, prevState),
        };
      }
      case 'subscribe:account:nominationPools:renamed': {
        const { poolName } = account.nominationPoolData!;
        const { prevName } = miscData;

        return {
          title: 'Nomination Pool Name',
          body: getNominationPoolRenamedText(poolName, prevName),
        };
      }
      case 'subscribe:account:nominationPools:roles': {
        const { poolRoles } = account.nominationPoolData!;
        const { poolRoles: prevRoles } = miscData;

        return {
          title: 'Nomination Pool Roles',
          body: getNominationPoolRolesText(poolRoles, prevRoles),
        };
      }
      case 'subscribe:account:nominationPools:commission': {
        const { poolCommission: cur } = account.nominationPoolData!;
        const { poolCommission: prev } = miscData;

        return {
          title: 'Nomination Pool Commission',
          body: getNominationPoolCommissionText(cur, prev),
        };
      }
      case 'subscribe:account:nominating:rewards': {
        return {
          title: 'Pending Payout',
          body: 'Staking rewards received in the previous era.',
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
