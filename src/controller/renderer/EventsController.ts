// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js';
import { chainCurrency, chainUnits } from '@/config/chains';
import {
  checkAccountWithProperties,
  checkFlattenedAccountWithProperties,
} from '@/utils/AccountUtils';
import { planckToUnit } from '@w3ux/utils';
import { getUnixTime } from 'date-fns';
import type { AnyData } from '@/types/misc';
import type { ApiCallEntry } from '@/types/subscriptions';
import type {
  EventAccountData,
  EventCallback,
  EventChainData,
} from '@/types/reporter';
import type { ActionMeta } from '@/types/tx';

export class EventsController {
  /**
   * @name getEvent
   * @summary Instantiate and return a new event based on the recieved entry and custom data.
   *
   * NOTE: `uid` is set to an empty string on the renderer side and initialized in the main process.
   */
  static getEvent(entry: ApiCallEntry, newVal: AnyData): EventCallback {
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
          subtitle: `${newVal}`,
          data: {
            timestamp: `${newVal}`,
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
          subtitle: `${newVal}`,
          data: {
            timestamp: `${newVal}`,
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

        const { chainId } = entry.task;
        const address = account.address;
        const accountName = entry.task.account!.name;

        const freeBalance = planckToUnit(
          new BigNumber(newVal.free.toString()),
          chainUnits(chainId)
        );

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
          title: 'Current Balance',
          subtitle: `${freeBalance} ${chainCurrency(chainId)}`,
          data: {
            balances: newVal,
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
          subtitle: `${pendingRewardsUnit.toString()} ${chainCurrency(chainId)}`,
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
        const { poolState } = flattenedAccount.nominationPoolData!;

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
          subtitle: `${poolState}`,
          data: {
            poolState,
          },
          timestamp: getUnixTime(new Date()),
          stale: false,
          actions: [],
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
        const { poolName } = flattenedAccount.nominationPoolData!;

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
          subtitle: `${poolName}`,
          data: {
            poolName,
          },
          timestamp: getUnixTime(new Date()),
          stale: false,
          actions: [],
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
        const { poolRoles } = flattenedAccount.nominationPoolData!;

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
          subtitle: 'Roles have changed.',
          data: {
            depositor: poolRoles.depositor,
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
