// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigAction } from '@polkadot-live/core';
import type { LedgerFeedbackAdaptor } from './types';

export const electronAdapter: LedgerFeedbackAdaptor = {
  handleLedgerTask: (task, payload) => {
    window.myAPI.doLedgerTask(task, payload);
  },

  handleSign: (info) => {
    ConfigAction.portAction.postMessage({
      task: 'renderer:ledger:sign',
      data: { info: JSON.stringify(info) },
    });
  },
};
