// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  ContextProxyExtrinsics,
  ContextProxyImport,
  ContextProxyMain,
} from './Proxy';
import { MainInterfaceWrapper } from '@polkadot-live/styles/wrappers';
import { Overlay, Help } from '@polkadot-live/ui/components';
import { useHelp, useOverlay } from '@polkadot-live/contexts';
import { useEffect, useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router';
import { FadeAction } from '@ren/screens/Action';
import { FadeImport } from '@ren/screens/Import';
import { FadeSettings } from './screens/Settings';
import { FadeOpenGov } from './screens/OpenGov';
import { Home } from './screens/Home';
import { ToastContainer } from 'react-toastify';
import { TabsWrapper } from '@ren/screens/Tabs';

export const RouterInner = () => {
  const { status: helpStatus, definition, closeHelp, setStatus } = useHelp();
  const overlayCtx = useOverlay();

  /**
   * Return routes for the window being rendered.
   */
  const addRoutesForWindow = () => {
    const windowId = window.myAPI.getWindowId();

    switch (windowId) {
      case 'main':
        return (
          <Route
            path={'/'}
            element={
              <ContextProxyMain>
                <Home />
              </ContextProxyMain>
            }
          />
        );
      case 'import':
        return (
          <Route
            path={'import'}
            element={
              <ContextProxyImport>
                <FadeImport />
              </ContextProxyImport>
            }
          />
        );
      case 'settings':
        return <Route path={'settings'} element={<FadeSettings />} />;
      case 'action':
        return (
          <Route
            path={'action'}
            element={
              <ContextProxyExtrinsics>
                <FadeAction />
              </ContextProxyExtrinsics>
            }
          />
        );
      case 'openGov':
        return <Route path={'openGov'} element={<FadeOpenGov />} />;
      default:
        throw new Error('Window ID not recognized.');
    }
  };

  return (
    <MainInterfaceWrapper>
      <Help
        status={helpStatus}
        definition={definition}
        closeHelp={closeHelp}
        setStatus={setStatus}
      />
      <Overlay overlayCtx={overlayCtx} />
      <ToastContainer stacked />
      <Routes>{addRoutesForWindow()}</Routes>
    </MainInterfaceWrapper>
  );
};

export const Router = () => {
  const [windowId] = useState<string>(window.myAPI.getWindowId());

  /**
   * Initialize analytics once.
   */
  useEffect(() => {
    window.myAPI.initAnalytics(
      navigator.userAgent,
      window.myAPI.getWindowId(),
      navigator.language
    );
  }, []);

  return (
    <HashRouter basename="/">
      {windowId === 'tabs' ? (
        <Routes>
          <Route path={'/tabs'} element={<TabsWrapper />} />
        </Routes>
      ) : (
        <RouterInner />
      )}
    </HashRouter>
  );
};

export default Router;
