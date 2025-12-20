// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigTabs } from '@polkadot-live/core';
import type { LedgerFeedbackAdapter } from './types';

export const electronAdapter: LedgerFeedbackAdapter = {
  handleLedgerTask: (task, payload) => {
    window.myAPI.doLedgerTask(task, payload);
  },

  handleSign: (info) => {
    ConfigTabs.portToMain.postMessage({
      task: 'renderer:ledger:sign',
      data: { info: JSON.stringify(info) },
    });
  },
};
