// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { AnyJson, EventAction, EventCallback } from '@polkadot-live/types';
import { ChainID } from '@polkadot-live/types/chains';

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
