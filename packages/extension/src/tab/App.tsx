// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  useConnections,
  useHelp,
  useOverlay,
  useTabs,
} from '@polkadot-live/contexts';
import { useEffect } from 'react';
import { Help, Overlay, Tabs } from '@polkadot-live/ui/components';
import { Action, Import, OpenGov, Settings } from '@polkadot-live/screens';
import { MainInterfaceWrapper } from '@polkadot-live/styles/wrappers';
import { ToastContainer } from 'react-toastify';
import { HashRouter, Route, Routes, useNavigate } from 'react-router';
import { ContextProxyTab } from './Proxy';
import './App.scss';

export const RouterInner = () => {
  const { tabsData, clickedId } = useTabs();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(tabsData.find((t) => t.id === clickedId)?.viewId || '/');
  }, [clickedId]);

  return (
    <ContextProxyTab>
      <Tabs tabsCtx={useTabs()} />
      <Routes>
        <Route path={'/'} element={null} />
        <Route path={'import'} element={<Import />} />
        <Route path={'settings'} element={<Settings platform={'chrome'} />} />
        <Route path={'action'} element={<Action />} />
        <Route path={'openGov'} element={<OpenGov />} />
      </Routes>
    </ContextProxyTab>
  );
};

export default function App() {
  const { cacheGet } = useConnections();
  const mode = cacheGet('mode:dark') ? 'dark' : 'light';
  const { status: helpStatus, definition, closeHelp, setStatus } = useHelp();
  const overlayCtx = useOverlay();

  return (
    <MainInterfaceWrapper className={`theme-polkadot-relay theme-${mode}`}>
      <Help
        status={helpStatus}
        definition={definition}
        closeHelp={closeHelp}
        setStatus={setStatus}
      />
      <Overlay overlayCtx={overlayCtx} />
      <ToastContainer stacked />
      <HashRouter basename="/">
        <RouterInner />
      </HashRouter>
    </MainInterfaceWrapper>
  );
}
