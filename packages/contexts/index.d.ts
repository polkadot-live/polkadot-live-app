// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { API } from '@polkadot-live/preload/preload';

declare global {
  interface Window {
    myAPI: typeof API;
  }
}

export {};
