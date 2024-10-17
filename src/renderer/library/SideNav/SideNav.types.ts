// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconProp } from '@fortawesome/fontawesome-svg-core';

export interface NavItemProps {
  children?: JSX.Element;
  icon?: IconProp;
  label?: string;
  selected: boolean;
  id: number;
  isCollapsed: boolean;
  setSelected: React.Dispatch<React.SetStateAction<number>>;
}

export interface SideNavProps {
  selected: number;
  setSelected: React.Dispatch<React.SetStateAction<number>>;
}
