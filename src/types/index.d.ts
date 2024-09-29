// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { API } from '@/preload';
import type { AnyData } from './misc';

declare global {
  interface Window {
    myAPI: typeof API;
    umami: AnyData;
  }
}

export {};
