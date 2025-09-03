// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useState } from 'react';
import { createSafeContextHook } from '../../utils/react-utils';
import type { SideNavContextInterface, SideNavProviderProps } from './types';

const SideNavContext = createContext<SideNavContextInterface | undefined>(
  undefined
);

export const useSideNav = createSafeContextHook(
  SideNavContext,
  'SideNavContext'
);

export const SideNavProvider = ({ children }: SideNavProviderProps) => {
  const [selectedId, setSelectedId] = useState(0);

  return (
    <SideNavContext
      value={{
        selectedId,
        setSelectedId,
      }}
    >
      {children}
    </SideNavContext>
  );
};
