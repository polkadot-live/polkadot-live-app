// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { MainInterfaceWrapper } from '@app/Wrappers';
import { Overlay } from '@app/library/Overlay';
import { Tooltip } from '@app/library/Tooltip';
import { useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Action } from '@app/screens/Action';
import { Home } from '@app/screens/Home';
import { Import } from '@app/screens/Import';
import { useAddresses } from '@app/contexts/Addresses';
import { useOnlineStatus } from './contexts/OnlineStatus';
import { useManage } from '@app/screens/Home/Manage/provider';
import { useTheme } from 'styled-components';
import type { AnyJson } from '@/types/misc';
import type { FlattenedAccounts } from '@/types/accounts';
import type { IpcRendererEvent } from 'electron';
import { useMessagePorts } from '@app/hooks/useMessagePorts';
import { useInitIpcHandlers } from '@app/hooks/useInitIpcHandlers';

export const RouterInner = () => {
  const { mode }: AnyJson = useTheme();
  const { setAddresses } = useAddresses();

  const { setRenderedSubscriptions } = useManage();
  const { setOnline } = useOnlineStatus();

  // Set up message ports communication between windows.
  useMessagePorts();

  // Set up app initialization handlers.
  useInitIpcHandlers();

  useEffect(() => {
    // Handle initial responses to populate state from store.
    window.myAPI.reportImportedAccounts(
      (_: IpcRendererEvent, accounts: string) => {
        const parsed: FlattenedAccounts = new Map(JSON.parse(accounts));
        setAddresses(parsed);
        setRenderedSubscriptions({ type: '', tasks: [] });
      }
    );

    window.myAPI.reportOnlineStatus((_: IpcRendererEvent, status: boolean) => {
      setOnline(status);
    });
  }, []);

  return (
    <MainInterfaceWrapper className={`theme-polkadot theme-${mode}`}>
      <Overlay />
      <Tooltip />
      <Routes>
        <Route path={'import'} element={<Import />} />
        <Route path={'action'} element={<Action />} />
        <Route path={'/'} element={<Home />} />
      </Routes>
    </MainInterfaceWrapper>
  );
};

export const Router = () => (
  <HashRouter basename="/">
    <RouterInner />
  </HashRouter>
);
export default Router;
