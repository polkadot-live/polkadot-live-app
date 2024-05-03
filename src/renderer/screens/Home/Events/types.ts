// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import type { EventCallback } from '@/types/reporter';

export interface EventCategoryProps {
  accordionActiveIndices: number[];
  accordionIndex: number;
  category: string;
  events: EventCallback[];
}

export interface EventItemProps {
  faIcon: IconProp;
  event: EventCallback;
}
