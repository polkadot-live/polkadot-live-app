// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { EventsContextInterface } from './types';

export const defaultEventsContext: EventsContextInterface = {
  events: {},
  //eslint-disable-next-line
  addEvent: (e) => {},
  //eslint-disable-next-line
  dismissEvent: (e) => {},
  //eslint-disable-next-line
  sortChainEvents: (c) => [],
};
