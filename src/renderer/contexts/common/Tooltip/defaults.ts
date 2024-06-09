// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { TooltipContextInterface } from './types';

export const defaultTooltipContext: TooltipContextInterface = {
  openTooltip: () => {},
  closeTooltip: () => {},
  setTooltipPosition: (x, y) => {},
  showTooltip: () => {},
  setTooltipTextAndOpen: (t) => {},
  alignRef: null,
  open: 0,
  show: 0,
  position: [0, 0],
  text: '',
};
