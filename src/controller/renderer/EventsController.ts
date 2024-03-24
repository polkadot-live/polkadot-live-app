// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { chainCurrency } from '@/config/chains';
import { ellipsisFn } from '@w3ux/utils';
import { getUnixTime } from 'date-fns';
import type { AnyData } from '@/types/misc';
import type { ApiCallEntry } from '@/types/subscriptions';
import type {
  EventAccountData,
  EventCallback,
  EventChainData,
} from '@/types/reporter';

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
          title: `${entry.task.chainId}: New Timestamp`,
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
          title: `${entry.task.chainId}: Current Slot`,
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

        return {
          uid: '',
          category: 'balances',
          who: {
            origin: 'account',
            data: { address, chainId: entry.task.chainId } as EventAccountData,
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
        const address = entry.task.account!.address;
        const chainId = entry.task.chainId;
        const pendingRewards =
          entry.task.account!.nominationPoolData?.poolPendingRewards;

        return {
          uid: '',
          category: 'nominationPools',
          who: {
            origin: 'account',
            data: { address, chainId: entry.task.chainId } as EventAccountData,
          },
          title: `${ellipsisFn(address)}: Unclaimed Nomination Pool Rewards`,
          subtitle: `${pendingRewards?.toString()} ${chainCurrency(chainId)}`,
          data: { pendingRewards: pendingRewards?.toString() },
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
