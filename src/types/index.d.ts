// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { API } from '@/preload';

declare global {
  interface Window {
    myAPI: typeof API;
  }
}

export {};
