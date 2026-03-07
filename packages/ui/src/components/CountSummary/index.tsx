// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faBell } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActiveCount, CountGroup, NotifyCount } from './Wrappers';
import type {
  ActiveSubCounts,
  ChainEventSubscription,
} from '@polkadot-live/types';
import type {
  IntervalSubscription,
  SubscriptionTask,
} from '@polkadot-live/types/subscriptions';

const computeCounts = (
  arr: ChainEventSubscription[] | SubscriptionTask[] | IntervalSubscription[],
): ActiveSubCounts =>
  arr.reduce(
    (acc, item) => {
      if (item && typeof item === 'object') {
        if ('enabled' in item) {
          // ChainEventSubscription
          const enabled = Boolean(item.enabled);
          acc.active += enabled ? 1 : 0;
          acc.osNotify += enabled && Boolean(item.osNotify) ? 1 : 0;
        } else if ('status' in item) {
          // SubscriptionTask or IntervalSubscription
          const enabled = item.status === 'enable';
          acc.active += enabled ? 1 : 0;
          acc.osNotify +=
            enabled && Boolean(item.enableOsNotifications) ? 1 : 0;
        }
      }
      return acc;
    },
    { active: 0, osNotify: 0 } as ActiveSubCounts,
  );

export const CountSummary = ({
  subs,
  badgeColor,
}: {
  subs: ChainEventSubscription[] | SubscriptionTask[] | IntervalSubscription[];
  badgeColor: string;
}) => {
  const { active, osNotify } = computeCounts(subs);

  return (
    <CountGroup>
      <ActiveCount $color={badgeColor} $active={active > 0}>
        {active}
      </ActiveCount>

      <NotifyCount $color={badgeColor} $active={osNotify > 0}>
        <FontAwesomeIcon
          icon={faBell}
          style={{ marginRight: '6px', fontSize: '0.9rem' }}
        />
        <span>{osNotify}</span>
      </NotifyCount>
    </CountGroup>
  );
};
