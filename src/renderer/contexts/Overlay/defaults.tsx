// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { OverlayContextInterface } from './types';

export const defaultOverlayContext: OverlayContextInterface = {
  // eslint-disable-next-line
  openOverlayWith: (o, s, t) => {},
  closeOverlay: () => {},
  setStatus: (s) => {},
  setOverlay: (d) => {},
  size: 'small',
  status: 0,
  transparent: false,
  Overlay: null,
};
