// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import type { ChainID } from '@/types/chains';
import type { EventCallback } from '@/types/reporter';

export interface EventCategoryProps {
  chain: ChainID;
  category: string;
  events: EventCallback[];
  i: number;
}

export interface EventItemProps {
  faIcon: IconProp;
  event: EventCallback;
}
