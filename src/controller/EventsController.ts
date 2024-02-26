// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { chainCurrency } from '@/config/chains';
import type { AnyData } from '@/types/misc';
import type { ApiCallEntry } from '@/types/subscriptions';
import { ellipsisFn } from '@w3ux/utils';
import { getUnixTime } from 'date-fns';

export class EventsController {
  static getEvent(entry: ApiCallEntry, newVal: AnyData) {
    switch (entry.task.action) {
      /*-------------------------------------------------- 
       subscribe:query.timestamp.now
       --------------------------------------------------*/

      case 'subscribe:query.timestamp.now': {
        return {
          uid: `chainEvents_timestamp_${newVal}`,
          category: 'timestamp',
          who: {
            chain: entry.task.chainId,
            address: 'none',
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

      /*-------------------------------------------------- 
       subscribe:query.babe.currentSlot
       --------------------------------------------------*/

      case 'subscribe:query.babe.currentSlot': {
        return {
          uid: `chainEvents_currentSlot_${newVal}`,
          category: 'currentSlot',
          who: {
            chain: entry.task.chainId,
            address: 'none',
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

      /*-------------------------------------------------- 
       subscribe:query.system.account
       --------------------------------------------------*/

      case 'subscribe:query.system.account': {
        const address = entry.task.actionArgs!.at(0)!;

        return {
          uid: `accountEvents_account_${ellipsisFn(address)}_${newVal.nonce}`,
          category: 'account',
          who: {
            chain: entry.task.chainId,
            address,
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

      /*-------------------------------------------------- 
       subscribe:nominationPools:query.system.account
       --------------------------------------------------*/

      case 'subscribe:nominationPools:query.system.account': {
        const address = entry.task.account!.address;
        const chainId = entry.task.chainId;
        const pendingRewards =
          entry.task.account!.nominationPoolData?.poolPendingRewards;

        return {
          uid: `accountEvents_account_${ellipsisFn(address)}_${pendingRewards}`,
          category: 'account',
          who: { chainId, address },
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
    }
  }
}
