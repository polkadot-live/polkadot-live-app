// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface SideNavContextInterface {
  isCollapsed: boolean;
  selectedId: number;
  setSelectedId: React.Dispatch<React.SetStateAction<number>>;
}

export interface SideNavProviderProps {
  children: React.ReactNode;
}
