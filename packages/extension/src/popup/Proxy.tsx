// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useMemo } from 'react';
import {
  useApiHealth,
  useAppSettings,
  useBootstrapping,
  useChains,
  useCogMenu,
} from './contexts';
import { useConnections } from '../contexts';
import { useHelp, useSideNav } from '@polkadot-live/ui/contexts';
import { buildCache, ContextProxyProvider } from '@polkadot-live/contexts';

interface ContextProxyProps {
  children: React.ReactNode;
}

export const ContextProxyMain = ({ children }: ContextProxyProps) => {
  const cache = useMemo(
    () =>
      buildCache({
        HelpCtx: () => useHelp(),
        ConnectionsCtx: () => useConnections(),
        AppSettingsCtx: () => useAppSettings(),
        SideNavCtx: () => useSideNav(),
        ApiHealthCtx: () => useApiHealth(),
        ChainsCtx: () => useChains(),
        BootstrappingCtx: () => useBootstrapping(),
        CogMenuCtx: () => useCogMenu(),
      }),
    []
  );
  return (
    <ContextProxyProvider initialCache={cache}>{children}</ContextProxyProvider>
  );
};
