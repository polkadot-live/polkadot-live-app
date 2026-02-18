// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { toast, Zoom } from 'react-toastify';
import type { ToastOptions, ToastPosition } from 'react-toastify';

/**
 * Util for rendering a toast notification.
 */
export const renderToast = (
  message: string,
  toastId: string,
  toastType: 'error' | 'success',
  position?: ToastPosition,
) => {
  const args: ToastOptions<unknown> = {
    position: position ? position : 'top-center',
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    closeButton: false,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
    theme: 'dark',
    transition: Zoom,
    toastId,
  };

  toastType === 'success'
    ? toast.success(message, args)
    : toast.error(message, args);
};
