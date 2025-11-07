// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { EventsAdapter } from './types';

export const electronAdapter: EventsAdapter = {
  removeEvent: async (event) => {
    await window.myAPI.sendEventTaskAsync({
      action: 'events:remove',
      data: { event },
    });
  },

  listenOnMount: () => null,
};
