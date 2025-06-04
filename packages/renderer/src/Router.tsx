// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { MainInterfaceWrapper } from '@ren/Wrappers';
import { Overlay, Help } from '@polkadot-live/ui/components';
import { useEffect, useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { FadeAction } from '@ren/screens/Action';
import { Tabs } from './screens/Tabs';
import { Home } from './screens/Home';
import { FadeImport } from '@ren/screens/Import';
import { FadeSettings } from './screens/Settings';
import { FadeInOpenGov } from './screens/OpenGov';
import { useHelp } from './contexts/common';
import { useTheme } from 'styled-components';
import { ToastContainer } from 'react-toastify';
import type { AnyJson } from '@polkadot-live/types/misc';

export const RouterInner = () => {
  const { mode }: AnyJson = useTheme();
  const { status: helpStatus, definition, closeHelp, setStatus } = useHelp();

  /// Return routes for the window being rendered.
  const addRoutesForWindow = () => {
    const windowId = window.myAPI.getWindowId();

    switch (windowId) {
      case 'main':
        return <Route path={'/'} element={<Home />} />;
      case 'import':
        return <Route path={'import'} element={<FadeImport />} />;
      case 'settings':
        return <Route path={'settings'} element={<FadeSettings />} />;
      case 'action':
        return <Route path={'action'} element={<FadeAction />} />;
      case 'openGov':
        return <Route path={'openGov'} element={<FadeInOpenGov />} />;
      default:
        throw new Error('Window ID not recognized.');
    }
  };

  return (
    <MainInterfaceWrapper className={`theme-polkadot theme-${mode}`}>
      <Help
        status={helpStatus}
        definition={definition}
        closeHelp={closeHelp}
        setStatus={setStatus}
      />
      <Overlay />
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
    <HashRouter
      basename="/"
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
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
