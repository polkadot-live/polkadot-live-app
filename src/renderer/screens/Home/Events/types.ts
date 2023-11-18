// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { ChainID } from '@/types/chains';
import { EventAction, EventCallback } from '@/types/reporter';
import { AnyJson } from '@/types/misc';

export interface EventCategoryProps {
  chain: ChainID;
  category: string;
  events: EventCallback[];
  i: number;
}

export interface EventItemProps {
  chain: ChainID;
  categoryKey: number;
  eventKey: number;
  uid: string;
  actions: EventAction[];
  title: string;
  subtitle: string;
  data: AnyJson;
  faIcon: IconProp;
  timestamp: number;
  who: {
    chain: ChainID;
    address: string;
  };
}
