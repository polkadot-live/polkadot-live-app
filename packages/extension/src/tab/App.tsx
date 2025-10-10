// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useConnections } from '../contexts';
import { useEffect } from 'react';
import { useHelp } from '@polkadot-live/ui/contexts';
import { useSettingFlags, useTabs } from './contexts';
import { Help, Overlay, Tabs } from '@polkadot-live/ui/components';
import { Settings } from '@polkadot-live/screens';
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
        <Route path={'/'} element={null} />
        <Route path={'import'} element={<h2>Accounts</h2>} />
        <Route
          path={'settings'}
          element={
            <Settings
              platform={'chrome'}
              connectionsCtx={useConnections()}
              helpCtx={useHelp()}
              settingsFlagsCtx={useSettingFlags()}
            />
          }
        />
        <Route path={'action'} element={<h2>Extrinsics</h2>} />
        <Route path={'openGov'} element={<h2>OpenGov</h2>} />
      </Routes>
    </>
  );
};

export default function App() {
  const { cacheGet } = useConnections();
  const mode = cacheGet('mode:dark') ? 'dark' : 'light';
  const { status: helpStatus, definition, closeHelp, setStatus } = useHelp();

  return (
    <MainInterfaceWrapper className={`theme-polkadot-relay theme-${mode}`}>
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
