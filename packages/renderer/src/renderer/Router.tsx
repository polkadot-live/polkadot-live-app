// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { MainInterfaceWrapper } from '@app/Wrappers';
import { Overlay, Tooltip } from '@app/library/components';
import { useEffect, useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Action } from '@app/screens/Action';
import { Tabs } from './screens/Tabs';
import { Home } from './screens/Home';
import { Import } from '@app/screens/Import';
import { Settings } from './screens/Settings';
import { OpenGov } from './screens/OpenGov';
import { Help } from './library/components/Help';
import { useBootstrapping } from '@app/contexts/main/Bootstrapping';
import { useTheme } from 'styled-components';
import { ToastContainer } from 'react-toastify';
import type { AnyJson } from '@polkadot-live/types/misc';
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
      case 'openGov':
        return <Route path={'openGov'} element={<OpenGov />} />;
      default:
        throw new Error('Window ID not recognized.');
    }
  };

  return (
    <MainInterfaceWrapper className={`theme-polkadot theme-${mode}`}>
      <Help />
      <Overlay />
      <Tooltip />
      <ToastContainer stacked />
      <Routes>{addRoutesForWindow()}</Routes>
    </MainInterfaceWrapper>
  );
};

export const Router = () => {
  const [windowId] = useState<string>(window.myAPI.getWindowId());

  /// Initialize analytics.
  useEffect(() => {
    window.myAPI.initAnalytics(
      navigator.userAgent,
      window.myAPI.getWindowId(),
      navigator.language
    );
  });

  return (
    <HashRouter basename="/">
      {windowId === 'tabs' ? (
        <Routes>
          <Route path={'/tabs'} element={<Tabs />} />
        </Routes>
      ) : (
        <RouterInner />
      )}
    </HashRouter>
  );
};

export default Router;
