// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js';
import { chainUnits } from '@/config/chains';
import {
  checkAccountWithProperties,
  checkFlattenedAccountWithProperties,
} from '@/utils/AccountUtils';
import {
  getBalanceText,
  getNominationPoolCommissionText,
  getNominationPoolRenamedText,
  getNominationPoolRolesText,
  getNominationPoolStateText,
} from '@/utils/TextUtils';
import { getUnixTime } from 'date-fns';
import { planckToUnit } from '@w3ux/utils';
import type { ActionMeta } from '@/types/tx';
import type { AnyData } from '@/types/misc';
import type { IntervalSubscription, ApiCallEntry } from '@/types/subscriptions';
import type {
  EventAccountData,
  EventCallback,
  EventChainData,
} from '@/types/reporter';

export class EventsController {
  /**
   * @name getIntervalEvent
   * @summary Same as `getEvent` but for interval subscription tasks.
   */
  static getIntervalEvent(
    task: IntervalSubscription,
    miscData: AnyData
  ): EventCallback {
    switch (task.action) {
      case 'subscribe:interval:openGov:referendumVotes': {
        const { action, chainId, referendumId } = task;
        const { ayeVotes, nayVotes } = miscData;

        return {
          uid: '',
          category: 'openGov',
          taskAction: action,
          who: {
            origin: 'interval',
            data: { chainId } as EventChainData,
          },
          title: `Referendum ${referendumId}`,
          subtitle: `Ayes at ${ayeVotes}% and Nayes at ${nayVotes}%.`,
          data: { referendumId, ayeVotes, nayVotes },
          timestamp: getUnixTime(new Date()),
          stale: false,
          actions: [
            {
              uri: `https://${chainId}.polkassembly.io/referenda/${referendumId}`,
              text: 'Polkassembly',
            },
            {
              uri: `https://${chainId}.subsquare.io/referenda/${referendumId}`,
              text: 'Subsquare',
            },
          ],
        };
      }
      case 'subscribe:interval:openGov:decisionPeriod': {
        const { action, chainId, referendumId } = task;
        const { formattedTime, subtext } = miscData;

        return {
          uid: '',
          category: 'openGov',
          taskAction: action,
          who: {
            origin: 'interval',
            data: { chainId } as EventChainData,
          },
          title: `Referendum ${referendumId}`,
          subtitle: subtext,
          data: { referendumId, formattedTime },
          timestamp: getUnixTime(new Date()),
          stale: false,
          actions: [
            {
              uri: `https://${chainId}.polkassembly.io/referenda/${referendumId}`,
              text: 'Polkassembly',
            },
            {
              uri: `https://${chainId}.subsquare.io/referenda/${referendumId}`,
              text: 'Subsquare',
            },
          ],
        };
      }
      case 'subscribe:interval:openGov:referendumThresholds': {
        const { action, chainId, referendumId } = task;
        const { formattedApp, formattedSup } = miscData;

        return {
          uid: '',
          category: 'openGov',
          taskAction: action,
          who: {
            origin: 'interval',
            data: { chainId } as EventChainData,
          },
          title: `Referendum ${referendumId}`,
          subtitle: `Approval thresold at ${formattedApp}% and support threshold at ${formattedSup}%`,
          data: { referendumId, formattedApp, formattedSup },
          timestamp: getUnixTime(new Date()),
          stale: false,
          actions: [
            {
              uri: `https://${chainId}.polkassembly.io/referenda/${referendumId}`,
              text: 'Polkassembly',
            },
            {
              uri: `https://${chainId}.subsquare.io/referenda/${referendumId}`,
              text: 'Subsquare',
            },
          ],
        };
      }
      default: {
        throw new Error('getEvent: Subscription task action not recognized');
      }
    }
  }

  /**
   * @name getEvent
   * @summary Return a new event based on the recieved entry and data.
   *
   * The `uid` field is set to an empty string on the renderer side and
   * initialized in the main process.
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
       * subscribe:account:balance:free
       */
      case 'subscribe:account:balance:free': {
        const account = checkAccountWithProperties(entry, ['balance']);
        const newFree = miscData.free;

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
          subtitle: getBalanceText(newFree, chainId),
          data: { free: newFree.toString() },
          timestamp: getUnixTime(new Date()),
          stale: false,
          actions: [],
        };
      }

      /**
       * subscribe:account:balance:frozen
       */
      case 'subscribe:account:balance:frozen': {
        const account = checkAccountWithProperties(entry, ['balance']);
        const newFrozen = miscData.frozen;

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
          title: 'Frozen Balance',
          subtitle: getBalanceText(newFrozen, chainId),
          data: { frozen: newFrozen.toString() },
          timestamp: getUnixTime(new Date()),
          stale: false,
          actions: [],
        };
      }

      /**
       * subscribe:account:balance:reserved
       */
      case 'subscribe:account:balance:reserved': {
        const account = checkAccountWithProperties(entry, ['balance']);
        const newReserved = miscData.reserved;

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
          title: 'Reserved Balance',
          subtitle: getBalanceText(newReserved, chainId),
          data: { frozen: newReserved.toString() },
          timestamp: getUnixTime(new Date()),
          stale: false,
          actions: [],
        };
      }

      /**
       * subscribe:account:balance:reserved
       */
      case 'subscribe:account:balance:spendable': {
        const account = checkAccountWithProperties(entry, ['balance']);
        const newSpendable = miscData.spendable;

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
          title: 'Spendable Balance',
          subtitle: getBalanceText(newSpendable, chainId),
          data: { spendable: newSpendable.toString() },
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

        const pendingRewardsPlanck = miscData.pendingRewardsPlanck as BigNumber;

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
          subtitle: getBalanceText(pendingRewardsPlanck, chainId),
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
              uri: `https://staking.polkadot.cloud/#/pools?n=${chainId}&a=${address}`,
              text: 'Dashboard',
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
          subtitle: getBalanceText(pendingPayout, chainId),
          data: {
            era,
            pendingPayout: pendingPayout.toString(), // string required
          },
          timestamp: getUnixTime(new Date()),
          stale: false,
          actions: [
            {
              uri: `https://staking.polkadot.cloud/#/nominate?n=${chainId}&a=${address}`,
              text: 'Dashboard',
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
        const { era, hasChanged }: { era: number; hasChanged: boolean } =
          miscData;

        const subtitle = hasChanged
          ? 'Commission change detected in your nominated validators.'
          : 'No commission changes detected.';

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
          data: { era, hasChanged },
          timestamp: getUnixTime(new Date()),
          stale: false,
          actions: [],
        };
      }
      /**
       * subscribe:account:nominating:nominations
       */
      case 'subscribe:account:nominating:nominations': {
        const { chainId } = entry.task;
        const { address, name: accountName } = entry.task.account!;
        const { era, hasChanged }: { era: number; hasChanged: boolean } =
          miscData;

        const subtitle = hasChanged
          ? 'A change has been detected in your nominated validator set.'
          : 'No changes detected in your nominated validator set.';

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
          title: 'Nominations Changed',
          subtitle,
          data: { era, hasChanged },
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
