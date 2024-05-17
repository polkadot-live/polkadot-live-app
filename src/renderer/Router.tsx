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
import { Settings } from './screens/Settings';
import { Help } from './library/Help';
import { useBootstrapping } from '@/renderer/contexts/Bootstrapping';
import { useTheme } from 'styled-components';
import { ToastContainer } from 'react-toastify';
import type { AnyJson } from '@/types/misc';
import type { IpcRendererEvent } from 'electron';

export const RouterInner = () => {
  const { mode }: AnyJson = useTheme();
  const { setOnline } = useBootstrapping();

  /// Listen for online status change.
  useEffect(() => {
    window.myAPI.reportOnlineStatus((_: IpcRendererEvent, status: boolean) => {
      setOnline(status);
    });
  }, []);

  /// Return routes for the window being rendered.
  const addRoutesForWindow = () => {
    const windowId = window.myAPI.getWindowId();

    switch (windowId) {
      case 'main':
        return <Route path={'/'} element={<Home />} />;
      case 'import':
        return <Route path={'import'} element={<Import />} />;
      case 'settings':
        return <Route path={'settings'} element={<Settings />} />;
      case 'action':
        return <Route path={'action'} element={<Action />} />;
      default:
        throw new Error('Window ID not recognized.');
    }
  };

  return (
    <MainInterfaceWrapper className={`theme-polkadot theme-${mode}`}>
      <Help />
      <Overlay />
      <Tooltip />
      <ToastContainer />
      <Routes>{addRoutesForWindow()}</Routes>
    </MainInterfaceWrapper>
  );
};

export const Router = () => (
  <HashRouter basename="/">
    <RouterInner />
  </HashRouter>
);
export default Router;
