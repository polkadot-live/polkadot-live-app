// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useMemo } from 'react';
import { useConnections } from '../contexts';
import { useHelp, useOverlay } from '@polkadot-live/ui/contexts';
import {
  buildCache,
  ContextProxyProvider,
  useDialogControl,
} from '@polkadot-live/contexts';
import {
  useAccountStatuses,
  useAddHandler,
  useDeleteHandler,
  useImportAddresses,
  useImportHandler,
  useRemoveHandler,
  useRenameHandler,
  useSettingFlags,
  useTabs,
} from './contexts';

interface ContextProxyProps {
  children: React.ReactNode;
}

export const ContextProxyTab = ({ children }: ContextProxyProps) => {
  const cache = useMemo(
    () =>
      buildCache({
        HelpCtx: () => useHelp(),
        OverlayCtx: () => useOverlay(),
        ConnectionsCtx: () => useConnections(),
        ImportAddressesCtx: () => useImportAddresses(),
        AccountStatusesCtx: () => useAccountStatuses(),
        ImportHandlerCtx: () => useImportHandler(),
        AddHandlerCtx: () => useAddHandler(),
        RemoveHandlerCtx: () => useRemoveHandler(),
        DeleteHandlerCtx: () => useDeleteHandler(),
        RenameHandlerCtx: () => useRenameHandler(),
        DialogControlCtx: () => useDialogControl(),
        SettingFlagsCtx: () => useSettingFlags(),
        TabsCtx: () => useTabs(),
      }),
    []
  );

  return (
    <ContextProxyProvider initialCache={cache}>{children}</ContextProxyProvider>
  );
};
