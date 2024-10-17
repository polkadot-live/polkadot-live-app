// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { SideNavContextInterface } from './types';

export const defaultSideNavContext: SideNavContextInterface = {
  isCollapsed: false,
  selectedId: 0,
  setSelectedId: () => {},
  setIsCollapsed: () => {},
};
