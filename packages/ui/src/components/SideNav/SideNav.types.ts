// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '@polkadot-live/types/misc';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';

interface NavState {
  isCollapsed: boolean;
  selectedId: number;
  setSelectedId: React.Dispatch<React.SetStateAction<number>>;
}

export interface SideNavProps {
  handleSideNavCollapse: () => void;
  navState: NavState;
  theme: AnyData;
}

export interface NavItemProps {
  children?: React.JSX.Element;
  icon?: IconProp;
  label?: string;
  id: number;
  navState: NavState;
}
