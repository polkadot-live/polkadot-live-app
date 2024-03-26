// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { chainCurrency, chainUnits } from '@/config/chains';
import { ellipsisFn, planckToUnit } from '@w3ux/utils';
import { getUnixTime } from 'date-fns';
import type { AnyData } from '@/types/misc';
import type { ApiCallEntry } from '@/types/subscriptions';
import type {
  EventAccountData,
  EventCallback,
  EventChainData,
} from '@/types/reporter';
import BigNumber from 'bignumber.js';

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
       * subscribe:query.timestamp.now
       */
      case 'subscribe:query.timestamp.now': {
        return {
          uid: '',
          category: 'debugging',
          who: {
            origin: 'chain',
            data: { chainId: entry.task.chainId } as EventChainData,
          },
          title: 'New Timestamp',
          subtitle: `${newVal}`,
          data: {
            timestamp: `${newVal}`,
          },
          timestamp: getUnixTime(new Date()),
          actions: [],
        };
      }

      /**
       * subscribe:query.babe.currentSlot
       */
      case 'subscribe:query.babe.currentSlot': {
        return {
          uid: '',
          category: 'debugging',
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
          actions: [],
        };
      }

      /**
       * subscribe:query.system.account
       */
      case 'subscribe:query.system.account': {
        const address = entry.task.actionArgs!.at(0)!;
        const accountName = entry.task.account?.name || ellipsisFn(address);

        return {
          uid: '',
          category: 'balances',
          who: {
            origin: 'account',
            data: {
              accountName,
              address,
              chainId: entry.task.chainId,
            } as EventAccountData,
          },
          title: `${ellipsisFn(address)}`,
          subtitle: `Free: ${newVal.free}, Reserved: ${newVal.reserved}, Nonce: ${newVal.nonce}`,
          data: {
            balances: newVal,
          },
          timestamp: getUnixTime(new Date()),
          actions: [],
        };
      }

      /**
       * subscribe:nominationPools:query.system.account
       */
      case 'subscribe:nominationPools:query.system.account': {
        if (!entry.task.account || !entry.task.account.nominationPoolData) {
          throw new Error('EventsController: account data not found for event');
        }

        // Data attached to event.
        const { address, name: accountName } = entry.task.account;
        const { chainId } = entry.task;
        const { poolPendingRewards } = entry.task.account.nominationPoolData;

        const pendingRewardsUnit = planckToUnit(
          new BigNumber(poolPendingRewards.toString()),
          chainUnits(chainId)
        );

        return {
          uid: '',
          category: 'nominationPools',
          who: {
            origin: 'account',
            data: {
              accountName,
              address,
              chainId: entry.task.chainId,
            } as EventAccountData,
          },
          title: `${ellipsisFn(address)}: Unclaimed Nomination Pool Rewards`,
          subtitle: `${pendingRewardsUnit.toString()} ${chainCurrency(chainId)}`,
          data: { pendingRewards: poolPendingRewards?.toString() },
          timestamp: getUnixTime(new Date()),
          actions: [
            {
              uri: 'bond',
              text: 'Bond',
            },
            {
              uri: 'withdraw',
              text: 'Withdraw',
            },
            {
              uri: `https://staking.polkadot.network/#/pools?n=${chainId}&a=${address}`,
              text: undefined,
            },
          ],
        };
      }
      default: {
        throw new Error('Subscription task action not recognized');
      }
    }
  }
}
