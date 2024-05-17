// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useMemo } from 'react';
import { Item } from './Item';
import { useEvents } from '@/renderer/contexts/main/Events';
import type { EventItemProps } from './types';

export const EventItem = function EventItem({ event, faIcon }: EventItemProps) {
  const { events } = useEvents();

  /// Memoize both event and icon objects.
  const { memoizedEvent, memoizedIcon } = useMemo(
    () => ({
      memoizedEvent: event,
      memoizedIcon: faIcon,
    }),
    [events]
  );

  return <Item faIcon={memoizedIcon} event={memoizedEvent} />;
};
