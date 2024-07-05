// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  getBalanceText,
  getNominationPoolCommissionText,
  getNominationPoolRenamedText,
  getNominationPoolRolesText,
  getNominationPoolStateText,
} from '@/utils/TextUtils';
import type { Account } from '@/model/Account';
import type { AnyData } from '@/types/misc';
import type { ApiCallEntry, IntervalSubscription } from '@/types/subscriptions';
import type { NotificationData } from '@/types/reporter';
import type { ValidatorData } from '@/types/accounts';
import type BigNumber from 'bignumber.js';

export class NotificationsController {
  /**
   * @name getIntervalNotification
   * @summary Return notification data based on the received interval subscription.
   */
  static getIntervalNotification(
    task: IntervalSubscription,
    miscData?: AnyData
  ): NotificationData {
    const { action, referendumId } = task;

    switch (action) {
      case 'subscribe:interval:openGov:referendumVotes': {
        const { percentAyes, percentNays } = miscData;
        return {
          title: `Referendum ${referendumId}`,
          body: `Ayes at ${percentAyes.toString()}% and Nayes at ${percentNays.toString()}%.`,
        };
      }
      case 'subscribe:interval:openGov:referendumThresholds': {
        const { formattedApp, formattedSup } = miscData;
        return {
          title: `Referendum ${referendumId}`,
          body: `Approval thresold at ${formattedApp}% and support threshold at ${formattedSup}%`,
        };
      }
      default: {
        throw new Error(
          `getIntervalNotification: Not implemented for ${task.action}`
        );
      }
    }
  }

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
      case 'subscribe:account:balance:free': {
        return {
          title: 'Free Balance',
          body: getBalanceText(miscData.free, account.chain),
        };
      }
      case 'subscribe:account:balance:frozen': {
        return {
          title: 'Frozen Balance',
          body: getBalanceText(miscData.frozen, account.chain),
        };
      }
      case 'subscribe:account:balance:reserved': {
        return {
          title: 'Reserved Balance',
          body: getBalanceText(miscData.reserved, account.chain),
        };
      }
      case 'subscribe:account:balance:spendable': {
        return {
          title: 'Spendable Balance',
          body: getBalanceText(miscData.spendable, account.chain),
        };
      }
      case 'subscribe:account:nominationPools:rewards': {
        return {
          title: 'Unclaimed Nomination Pool Rewards',
          body: getBalanceText(
            miscData.pendingRewardsPlanck as BigNumber,
            account.chain
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
      case 'subscribe:account:nominating:pendingPayouts': {
        const { pendingPayout, chainId } = miscData;

        return {
          title: 'Nominating Pending Payout',
          body: getBalanceText(pendingPayout, chainId),
        };
      }
      case 'subscribe:account:nominating:exposure': {
        const { exposed } = miscData;

        const body = exposed
          ? `Actively nominating in the current era.`
          : `NOT actively nominating in the current era.`;

        return {
          title: 'Era Exposure',
          body,
        };
      }
      case 'subscribe:account:nominating:commission': {
        const { updated }: { updated: ValidatorData[] } = miscData;

        const body =
          updated.length === 1
            ? `${updated.length} nominated validator has changed commission.`
            : `${updated.length} nominated validators have changed commission.`;

        return {
          title: 'Commission Changed',
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
