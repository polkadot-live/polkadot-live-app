// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useMemo } from 'react';
import { Item } from './Item';
import { useEvents } from '@ren/contexts/main';
import type { EventItemProps } from './types';

export const EventItem = function EventItem({ event }: EventItemProps) {
  const { events } = useEvents();

  /// Memoize both event and icon objects.
  const { memoizedEvent } = useMemo(
    () => ({
      memoizedEvent: event,
    }),
    [events]
  );

  return <Item event={memoizedEvent} />;
};
