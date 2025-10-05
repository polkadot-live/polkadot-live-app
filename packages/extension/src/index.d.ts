// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// @theme-toggles fix.
declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    placeholder?: string | undefined;
  }

  interface DOMAttributes<T> {
    onPointerEnterCapture?: React.PointerEventHandler<T> | undefined;
    onPointerLeaveCapture?: React.PointerEventHandler<T> | undefined;
  }
}

export {};
