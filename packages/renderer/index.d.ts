// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { API } from '@polkadot-live/preload/preload';

declare global {
  interface Window {
    myAPI: typeof API;
  }
}

// For @theme-toggles types.
// https://github.com/AlfieJones/theme-toggles/issues/30
declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    placeholder?: string | undefined;
  }

  interface DOMAttributes<T> {
    onPointerEnterCapture?: React.PointerEventHandler<T> | undefined;
    onPointerLeaveCapture?: React.PointerEventHandler<T> | undefined;
  }
}
