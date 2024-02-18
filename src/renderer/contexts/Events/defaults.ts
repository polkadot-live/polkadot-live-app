// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { EventsContextInterface } from './types';

export const defaultEventsContext: EventsContextInterface = {
  events: {},
  addEvent: (e) => {},
  dismissEvent: (e) => {},
  sortChainEvents: (c) => [],
};
