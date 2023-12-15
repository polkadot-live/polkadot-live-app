import type { ApiCallEntry } from '@/types/subscriptions';
import { getUnixTime } from 'date-fns';

export class EventsController {
  static getEvent(entry: ApiCallEntry, newVal: string) {
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
       subscribe:query.babde.currentSlot
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
    }
  }
}
