// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  getBalanceText,
  getNominationPoolCommissionText,
  getNominationPoolRenamedText,
  getNominationPoolRolesText,
  getNominationPoolStateText,
} from '@ren/utils/TextUtils';
import type { Account } from '@ren/model/Account';
import type { AnyData } from '@polkadot-live/types/misc';
import type {
  ApiCallEntry,
  IntervalSubscription,
} from '@polkadot-live/types/subscriptions';
import type { ChainID } from '@polkadot-live/types/chains';
import type { NominationPoolRoles } from '@polkadot-live/types/accounts';
import type { NotificationData } from '@polkadot-live/types/reporter';

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
        const {
          percentAyes,
          percentNays,
        }: { percentAyes: string; percentNays: string } = miscData;

        return {
          title: `Referendum ${referendumId}`,
          body: `Ayes at ${percentAyes}% and Nayes at ${percentNays}%.`,
          subtitle: `Votes Tally`,
        };
      }
      case 'subscribe:interval:openGov:referendumThresholds': {
        const {
          formattedApp,
          formattedSup,
        }: { formattedApp: string; formattedSup: string } = miscData;

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
        const { free }: { free: bigint } = miscData;
        return {
          title: account.name,
          body: getBalanceText(free, account.chain),
          subtitle: 'Free Balance',
        };
      }
      case 'subscribe:account:balance:frozen': {
        const { frozen }: { frozen: bigint } = miscData;
        return {
          title: account.name,
          body: getBalanceText(frozen, account.chain),
          subtitle: 'Frozen Balance',
        };
      }
      case 'subscribe:account:balance:reserved': {
        const { reserved }: { reserved: bigint } = miscData;
        return {
          title: account.name,
          body: getBalanceText(reserved, account.chain),
          subtitle: 'Reserved Balance',
        };
      }
      case 'subscribe:account:balance:spendable': {
        const { spendable }: { spendable: bigint } = miscData;
        return {
          title: account.name,
          body: getBalanceText(spendable, account.chain),
          subtitle: 'Spendable Balance',
        };
      }
      case 'subscribe:account:nominationPools:rewards': {
        const { pending }: { pending: bigint } = miscData;
        return {
          title: account.name,
          body: getBalanceText(pending, account.chain),
          subtitle: 'Nomination Pool Rewards',
        };
      }
      case 'subscribe:account:nominationPools:state': {
        const { poolState } = account.nominationPoolData!;
        const { prev }: { prev: string } = miscData;

        return {
          title: account.name,
          body: getNominationPoolStateText(poolState, prev),
          subtitle: 'Nomiantion Pool State',
        };
      }
      case 'subscribe:account:nominationPools:renamed': {
        const { poolName } = account.nominationPoolData!;
        const { prev }: { prev: string } = miscData;

        return {
          title: account.name,
          body: getNominationPoolRenamedText(poolName, prev),
          subtitle: 'Nomination Pool Name',
        };
      }
      case 'subscribe:account:nominationPools:roles': {
        const { poolRoles } = account.nominationPoolData!;
        const { prev }: { prev: NominationPoolRoles } = miscData;

        return {
          title: account.name,
          body: getNominationPoolRolesText(poolRoles, prev),
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
        const { rewards, chainId }: { rewards: string; chainId: ChainID } =
          miscData;

        return {
          title: account.name,
          body: getBalanceText(rewards, chainId),
          subtitle: 'Nominating Rewards',
        };
      }
      case 'subscribe:account:nominating:exposure': {
        const { exposed }: { exposed: boolean } = miscData;

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
