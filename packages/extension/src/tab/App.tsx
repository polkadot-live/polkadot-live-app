// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffect } from 'react';
import { useHelp } from '@polkadot-live/ui/contexts';
import { useTabs } from './contexts';
import { Help, Overlay, Tabs } from '@polkadot-live/ui/components';
import { MainInterfaceWrapper } from '@polkadot-live/styles/wrappers';
import { ToastContainer } from 'react-toastify';
import { HashRouter, Route, Routes, useNavigate } from 'react-router';
import './App.scss';

export const RouterInner = () => {
  const { tabsData, clickedId } = useTabs();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(tabsData.find((t) => t.id === clickedId)?.viewId || '/');
  }, [clickedId]);

  return (
    <>
      <Tabs tabsCtx={useTabs()} />
      <Routes>
        <Route path={'/'} element={null} />;
        <Route path={'import'} element={<h2>Accounts</h2>} />;
        <Route path={'settings'} element={<h2>Settings</h2>} />;
        <Route path={'action'} element={<h2>Extrinsics</h2>} />;
        <Route path={'openGov'} element={<h2>OpenGov</h2>} />;
      </Routes>
    </>
  );
};

export default function App() {
  const mode = 'dark';
  const { status: helpStatus, definition, closeHelp, setStatus } = useHelp();

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
      <HashRouter basename="/">
        <RouterInner />
      </HashRouter>
    </MainInterfaceWrapper>
  );
}
