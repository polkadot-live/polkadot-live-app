// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { OverlayContextInterface } from './types';

export const defaultOverlayContext: OverlayContextInterface = {
  setOnCloseOverlay: () => {},
  openOverlayWith: (o, s, t) => {},
  closeOverlay: () => {},
  setStatus: (s) => {},
  setOverlay: (d) => {},
  setDisableClose: (d) => {},
  size: 'small',
  status: 0,
  transparent: false,
  Overlay: null,
  disableClose: false,
};
