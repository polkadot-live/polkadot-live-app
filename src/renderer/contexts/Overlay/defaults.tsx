// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { OverlayContextInterface } from './types';

export const defaultOverlayContext: OverlayContextInterface = {
  // eslint-disable-next-line
  openOverlayWith: (o, s, t) => {},
  // eslint-disable-next-line
  closeOverlay: () => {},
  // eslint-disable-next-line
  setStatus: (s) => {},
  // eslint-disable-next-line
  setOverlay: (d) => {},
  size: 'small',
  status: 0,
  transparent: false,
  Overlay: null,
};
