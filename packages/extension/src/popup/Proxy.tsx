// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useMemo } from 'react';
import {
  useBootstrapping,
  useCogMenu,
  useEvents,
  useIntervalSubscriptions,
  useIntervalTasksManager,
  useSummary,
} from './contexts';
import { useHelp, useSideNav } from '@polkadot-live/ui/contexts';
import {
  buildCache,
  ContextProxyProvider,
  useAddresses,
  useApiHealth,
  useAppSettings,
  useChains,
  useConnections,
  useManage,
  useSubscriptions,
} from '@polkadot-live/contexts';

interface ContextProxyProps {
  children: React.ReactNode;
}

export const ContextProxyMain = ({ children }: ContextProxyProps) => {
  const cache = useMemo(
    () =>
      buildCache({
        HelpCtx: () => useHelp(),
        ConnectionsCtx: () => useConnections(),
        AddressesCtx: () => useAddresses(),
        AppSettingsCtx: () => useAppSettings(),
        SideNavCtx: () => useSideNav(),
        ApiHealthCtx: () => useApiHealth(),
        ChainsCtx: () => useChains(),
        ManageCtx: () => useManage(),
        SubscriptionsCtx: () => useSubscriptions(),
        IntervalSubscriptionsCtx: () => useIntervalSubscriptions(),
        IntervalTaskManagerCtx: () => useIntervalTasksManager(),
        EventsCtx: () => useEvents(),
        BootstrappingCtx: () => useBootstrapping(),
        CogMenuCtx: () => useCogMenu(),
        SummaryCtx: () => useSummary(),
      }),
    []
  );
  return (
    <ContextProxyProvider initialCache={cache}>{children}</ContextProxyProvider>
  );
};
