// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EventsContextInterface } from './types';

export const defaultEventsContext: EventsContextInterface = {
  events: {},
  //eslint-disable-next-line
  addEvent: (e) => {},
  //eslint-disable-next-line
  dismissEvent: (e) => {},
  //eslint-disable-next-line
  sortChainEvents: (c) => [],
};
