// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useContext, useState } from 'react';
import { defaultSideNavContext } from './defaults';
import type { SideNavContextInterface, SideNavProviderProps } from './types';

const SideNavContext = createContext<SideNavContextInterface>(
  defaultSideNavContext
);

export const useSideNav = () => useContext(SideNavContext);

export const SideNavProvider = ({ children }: SideNavProviderProps) => {
  const [selectedId, setSelectedId] = useState(0);

  return (
    <SideNavContext.Provider
      value={{
        selectedId,
        setSelectedId,
      }}
    >
      {children}
    </SideNavContext.Provider>
  );
};
