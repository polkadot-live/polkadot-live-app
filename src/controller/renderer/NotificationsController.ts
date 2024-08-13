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
          subtitle: `Votes Tally`,
        };
      }
      case 'subscribe:interval:openGov:referendumThresholds': {
        const { formattedApp, formattedSup } = miscData;
        return {
          title: `Referendum ${referendumId}`,
          body: `Approval at ${formattedApp}% and support at ${formattedSup}%`,
          subtitle: `Thresholds`,
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
          title: account.name,
          body: getBalanceText(miscData.free, account.chain),
          subtitle: 'Free Balance',
        };
      }
      case 'subscribe:account:balance:frozen': {
        return {
          title: account.name,
          body: getBalanceText(miscData.frozen, account.chain),
          subtitle: 'Frozen Balance',
        };
      }
      case 'subscribe:account:balance:reserved': {
        return {
          title: account.name,
          body: getBalanceText(miscData.reserved, account.chain),
          subtitle: 'Reserved Balance',
        };
      }
      case 'subscribe:account:balance:spendable': {
        return {
          title: account.name,
          body: getBalanceText(miscData.spendable, account.chain),
          subtitle: 'Spendable Balance',
        };
      }
      case 'subscribe:account:nominationPools:rewards': {
        return {
          title: account.name,
          body: getBalanceText(
            miscData.pendingRewardsPlanck as BigNumber,
            account.chain
          ),
          subtitle: 'Nomination Pool Rewards',
        };
      }
      case 'subscribe:account:nominationPools:state': {
        const { poolState } = account.nominationPoolData!;
        const { prevState } = miscData;

        return {
          title: account.name,
          body: getNominationPoolStateText(poolState, prevState),
          subtitle: 'Nomiantion Pool State',
        };
      }
      case 'subscribe:account:nominationPools:renamed': {
        const { poolName } = account.nominationPoolData!;
        const { prevName } = miscData;

        return {
          title: account.name,
          body: getNominationPoolRenamedText(poolName, prevName),
          subtitle: 'Nomination Pool Name',
        };
      }
      case 'subscribe:account:nominationPools:roles': {
        const { poolRoles } = account.nominationPoolData!;
        const { poolRoles: prevRoles } = miscData;

        return {
          title: account.name,
          body: getNominationPoolRolesText(poolRoles, prevRoles),
          subtitle: 'Nomination Pool Roles',
        };
      }
      case 'subscribe:account:nominationPools:commission': {
        const { poolCommission: cur } = account.nominationPoolData!;
        const { poolCommission: prev } = miscData;

        return {
          title: account.name,
          body: getNominationPoolCommissionText(cur, prev),
          subtitle: 'Nomination Pool Commission',
        };
      }
      case 'subscribe:account:nominating:pendingPayouts': {
        const { pendingPayout, chainId } = miscData;

        return {
          title: account.name,
          body: getBalanceText(pendingPayout, chainId),
          subtitle: 'Nominating Pending Payout',
        };
      }
      case 'subscribe:account:nominating:exposure': {
        const { exposed } = miscData;

        const body = exposed
          ? `Actively nominating in the current era.`
          : `NOT actively nominating in the current era.`;

        return {
          title: account.name,
          body,
          subtitle: 'Era Exposure',
        };
      }
      case 'subscribe:account:nominating:commission': {
        const { hasChanged }: { hasChanged: boolean } = miscData;

        const body = hasChanged
          ? 'Commission change detected in your nominated validators.'
          : 'No commission changes detected.';

        return {
          title: account.name,
          body,
          subtitle: 'Commission Changed',
        };
      }
      case 'subscribe:account:nominating:nominations': {
        const { hasChanged }: { hasChanged: boolean } = miscData;

        const body = hasChanged
          ? 'A change has been detected in your nominated validator set.'
          : 'No changes detected in your nominated validator set.';

        return {
          title: account.name,
          body,
          subtitle: 'Nominations Changed',
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
