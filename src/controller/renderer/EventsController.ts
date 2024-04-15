// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js';
import { chainUnits } from '@/config/chains';
import {
  checkAccountWithProperties,
  checkFlattenedAccountWithProperties,
} from '@/utils/AccountUtils';
import {
  getFreeBalanceText,
  getNominatingPendingPayoutText,
  getNominationPoolCommissionText,
  getNominationPoolRenamedText,
  getNominationPoolRolesText,
  getNominationPoolStateText,
  getPendingRewardsText,
} from '@/utils/EventUtils';
import { getUnixTime } from 'date-fns';
import { planckToUnit } from '@w3ux/utils';
import type { ActionMeta } from '@/types/tx';
import type { AnyData } from '@/types/misc';
import type { ApiCallEntry } from '@/types/subscriptions';
import type {
  EventAccountData,
  EventCallback,
  EventChainData,
} from '@/types/reporter';
import type { ValidatorData } from '@/types/accounts';

export class EventsController {
  /**
   * @name getEvent
   * @summary Instantiate and return a new event based on the recieved entry and custom data.
   *
   * NOTE: `uid` is set to an empty string on the renderer side and initialized in the main process.
   */
  static getEvent(entry: ApiCallEntry, miscData: AnyData): EventCallback {
    switch (entry.task.action) {
      /**
       * subscribe:chain:timestamp
       */
      case 'subscribe:chain:timestamp': {
        return {
          uid: '',
          category: 'debugging',
          taskAction: entry.task.action,
          who: {
            origin: 'chain',
            data: { chainId: entry.task.chainId } as EventChainData,
          },
          title: 'Current Timestamp',
          subtitle: `${miscData}`,
          data: {
            timestamp: `${miscData}`,
          },
          timestamp: getUnixTime(new Date()),
          stale: false,
          actions: [],
        };
      }

      /**
       * subscribe:chain:currentSlot
       */
      case 'subscribe:chain:currentSlot': {
        return {
          uid: '',
          category: 'debugging',
          taskAction: entry.task.action,
          who: {
            origin: 'chain',
            data: { chainId: entry.task.chainId } as EventChainData,
          },
          title: 'Current Slot',
          subtitle: `${miscData}`,
          data: {
            timestamp: `${miscData}`,
          },
          timestamp: getUnixTime(new Date()),
          stale: false,
          actions: [],
        };
      }

      /**
       * subscribe:query.system.account
       */
      case 'subscribe:account:balance': {
        const account = checkAccountWithProperties(entry, ['balance']);
        const newBalance = miscData.received.free;

        const { chainId } = entry.task;
        const address = account.address;
        const accountName = entry.task.account!.name;

        return {
          uid: '',
          category: 'balances',
          taskAction: entry.task.action,
          who: {
            origin: 'account',
            data: {
              accountName,
              address,
              chainId,
            } as EventAccountData,
          },
          title: 'Free Balance',
          subtitle: getFreeBalanceText(newBalance, chainId),
          data: {
            balances: miscData,
          },
          timestamp: getUnixTime(new Date()),
          stale: false,
          actions: [],
        };
      }

      /**
       * subscribe:account:nominationPools:rewards
       */
      case 'subscribe:account:nominationPools:rewards': {
        const flattenedAccount = checkFlattenedAccountWithProperties(entry, [
          'nominationPoolData',
        ]);

        const { chainId } = entry.task;
        const { address, name: accountName, source } = flattenedAccount;
        const { poolPendingRewards } = flattenedAccount.nominationPoolData!;

        const pendingRewardsUnit = planckToUnit(
          new BigNumber(poolPendingRewards.toString()),
          chainUnits(chainId)
        );

        return {
          uid: '',
          category: 'nominationPools',
          taskAction: entry.task.action,
          who: {
            origin: 'account',
            data: {
              accountName,
              address,
              chainId: entry.task.chainId,
              source,
            } as EventAccountData,
          },
          title: 'Unclaimed Nomination Pool Rewards',
          subtitle: getPendingRewardsText(
            chainId,
            miscData.pendingRewardsPlanck
          ),
          data: { pendingRewards: poolPendingRewards?.toString() },
          timestamp: getUnixTime(new Date()),
          stale: false,
          actions: [
            {
              uri: 'bond',
              text: 'Compound',
              txMeta: {
                eventUid: '',
                from: address,
                accountName,
                action: 'nominationPools_pendingRewards_bond',
                pallet: 'nominationPools',
                method: 'bondExtra',
                chainId,
                args: [{ Rewards: null }],
                data: {
                  extra: pendingRewardsUnit.toNumber(),
                },
              } as ActionMeta,
            },
            {
              uri: 'withdraw',
              text: 'Withdraw',
              txMeta: {
                eventUid: '',
                from: address,
                accountName,
                action: 'nominationPools_pendingRewards_withdraw',
                pallet: 'nominationPools',
                method: 'claimPayout',
                chainId,
                args: [],
                data: {
                  extra: pendingRewardsUnit.toNumber(),
                },
              } as ActionMeta,
            },
            {
              uri: `https://staking.polkadot.network/#/pools?n=${chainId}&a=${address}`,
              text: undefined,
            },
          ],
        };
      }
      /**
       * subscribe:account:nominationPools:state
       */
      case 'subscribe:account:nominationPools:state': {
        const flattenedAccount = checkFlattenedAccountWithProperties(entry, [
          'nominationPoolData',
        ]);

        const { chainId } = entry.task;
        const { address, name: accountName } = flattenedAccount;
        const { poolState, poolId } = flattenedAccount.nominationPoolData!;
        const { prevState } = miscData;

        return {
          uid: '',
          category: 'nominationPools',
          taskAction: entry.task.action,
          who: {
            origin: 'account',
            data: {
              accountName,
              address,
              chainId,
            } as EventAccountData,
          },
          title: 'Nomination Pool State',
          subtitle: getNominationPoolStateText(poolState, prevState),
          data: {
            poolState,
          },
          timestamp: getUnixTime(new Date()),
          stale: false,
          actions: [
            {
              uri: `https://${chainId}.subscan.io/nomination_pool/${poolId}?tab=activities`,
              text: `Subscan`,
            },
          ],
        };
      }
      /**
       * subscribe:account:nominationPools:renamed
       */
      case 'subscribe:account:nominationPools:renamed': {
        const flattenedAccount = checkFlattenedAccountWithProperties(entry, [
          'nominationPoolData',
        ]);

        const { chainId } = entry.task;
        const { address, name: accountName } = flattenedAccount;
        const { poolName, poolId } = flattenedAccount.nominationPoolData!;
        const { prevName } = miscData;

        return {
          uid: '',
          category: 'nominationPools',
          taskAction: entry.task.action,
          who: {
            origin: 'account',
            data: {
              accountName,
              address,
              chainId,
            } as EventAccountData,
          },
          title: 'Nomination Pool Name',
          subtitle: getNominationPoolRenamedText(poolName, prevName),
          data: {
            poolName,
          },
          timestamp: getUnixTime(new Date()),
          stale: false,
          actions: [
            {
              uri: `https://${chainId}.subscan.io/nomination_pool/${poolId}`,
              text: `Subscan`,
            },
          ],
        };
      }
      /**
       * subscribe:account:nominationPools:roles
       */
      case 'subscribe:account:nominationPools:roles': {
        const flattenedAccount = checkFlattenedAccountWithProperties(entry, [
          'nominationPoolData',
        ]);

        const { chainId } = entry.task;
        const { address, name: accountName } = flattenedAccount;
        const { poolRoles, poolId } = flattenedAccount.nominationPoolData!;
        const { poolRoles: prevRoles } = miscData;

        return {
          uid: '',
          category: 'nominationPools',
          taskAction: entry.task.action,
          who: {
            origin: 'account',
            data: {
              accountName,
              address,
              chainId,
            } as EventAccountData,
          },
          title: 'Nomination Pool Roles',
          subtitle: getNominationPoolRolesText(poolRoles, prevRoles),
          data: {
            depositor: poolRoles.depositor,
          },
          timestamp: getUnixTime(new Date()),
          stale: false,
          actions: [
            {
              uri: `https://${chainId}.subscan.io/nomination_pool/${poolId}`,
              text: `Subscan`,
            },
          ],
        };
      }
      /**
       * subscribe:account:nominationPools:commission
       */
      case 'subscribe:account:nominationPools:commission': {
        const flattenedAccount = checkFlattenedAccountWithProperties(entry, [
          'nominationPoolData',
        ]);

        const { chainId } = entry.task;
        const { address, name: accountName } = flattenedAccount;
        const { poolCommission } = flattenedAccount.nominationPoolData!;
        const { poolCommission: prevCommission } = miscData;

        return {
          uid: '',
          category: 'nominationPools',
          taskAction: entry.task.action,
          who: {
            origin: 'account',
            data: {
              accountName,
              address,
              chainId,
            } as EventAccountData,
          },
          title: 'Nomination Pool Commission',
          subtitle: getNominationPoolCommissionText(
            poolCommission,
            prevCommission
          ),
          data: {
            ...poolCommission,
          },
          timestamp: getUnixTime(new Date()),
          stale: false,
          actions: [],
        };
      }
      /**
       * subscribe:account:nominating:pendingPayouts
       */
      case 'subscribe:account:nominating:pendingPayouts': {
        // eslint-disable-next-line prettier/prettier
        const { pendingPayout, era }: { pendingPayout: BigNumber; era: string } = miscData;
        const { chainId } = entry.task;
        const { address, name: accountName } = entry.task.account!;

        return {
          uid: '',
          category: 'nominating',
          taskAction: entry.task.action,
          who: {
            origin: 'account',
            data: {
              accountName,
              address,
              chainId,
            } as EventAccountData,
          },
          title: 'Nominating Pending Payout',
          subtitle: getNominatingPendingPayoutText(pendingPayout, chainId),
          data: {
            era,
            pendingPayout: pendingPayout.toString(), // string required
          },
          timestamp: getUnixTime(new Date()),
          stale: false,
          actions: [
            {
              uri: `https://staking.polkadot.network/#/nominate?n=${chainId}&a=${address}`,
              text: 'Staking Dashboard',
            },
          ],
        };
      }
      /**
       * subscribe:account:nominating:exposure
       */
      case 'subscribe:account:nominating:exposure': {
        const { chainId } = entry.task;
        const { address, name: accountName } = entry.task.account!;
        const { era, exposed }: { era: number; exposed: boolean } = miscData;

        const subtitle = exposed
          ? `Actively nominating in the current era.`
          : `NOT actively nominating in the current era.`;

        return {
          uid: '',
          category: 'nominating',
          taskAction: entry.task.action,
          who: {
            origin: 'account',
            data: {
              accountName,
              address,
              chainId,
            } as EventAccountData,
          },
          title: 'Era Exposure',
          subtitle,
          data: {
            era,
            exposed,
          },
          timestamp: getUnixTime(new Date()),
          stale: false,
          actions: [],
        };
      }
      /**
       * subscribe:account:nominating:commission
       */
      case 'subscribe:account:nominating:commission': {
        const { chainId } = entry.task;
        const { address, name: accountName } = entry.task.account!;
        const { updated }: { updated: ValidatorData[] } = miscData;

        const subtitle =
          updated.length === 1
            ? `${updated.length} nominated validator has changed commission.`
            : `${updated.length} nominated validators have changed commission.`;

        return {
          uid: '',
          category: 'nominating',
          taskAction: entry.task.action,
          who: {
            origin: 'account',
            data: {
              accountName,
              address,
              chainId,
            } as EventAccountData,
          },
          title: 'Commission Changed',
          subtitle,
          data: {
            updated: [...updated],
          },
          timestamp: getUnixTime(new Date()),
          stale: false,
          actions: [],
        };
      }
      default: {
        throw new Error('getEvent: Subscription task action not recognized');
      }
    }
  }
}
