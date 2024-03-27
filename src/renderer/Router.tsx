// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { MainInterfaceWrapper } from '@app/Wrappers';
import { Overlay } from '@app/library/Overlay';
import { Tooltip } from '@app/library/Tooltip';
import { useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Action } from '@app/screens/Action';
import { Home } from './screens/Home';
import { Import } from '@app/screens/Import';
import { useOnlineStatus } from '@app/contexts/OnlineStatus';
import { useMessagePorts } from '@app/hooks/useMessagePorts';
import { useTheme } from 'styled-components';
import type { AnyJson } from '@/types/misc';
import type { IpcRendererEvent } from 'electron';

export const RouterInner = () => {
  const { mode }: AnyJson = useTheme();
  const { setOnline } = useOnlineStatus();

  // Set up message ports communication between windows.
  useMessagePorts();

  useEffect(() => {
    // Listen for online status change.
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
