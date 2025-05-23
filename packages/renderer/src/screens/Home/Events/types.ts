// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { EventCallback } from '@polkadot-live/types/reporter';

export interface EventCategoryProps {
  category: string;
  events: EventCallback[];
}

export interface EventItemProps {
  event: EventCallback;
}

export interface ItemProps {
  event: EventCallback;
}
