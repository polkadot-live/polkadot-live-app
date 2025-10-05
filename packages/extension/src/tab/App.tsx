// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Help, Overlay } from '@polkadot-live/ui/components';
import { MainInterfaceWrapper } from '@polkadot-live/styles/wrappers';
import { useHelp } from '@polkadot-live/ui/contexts';
import { ToastContainer } from 'react-toastify';
import { HashRouter, Route, Routes } from 'react-router';
import './App.scss';

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
      {/* TODO: Tabs */}
      <HashRouter basename="/">
        <Routes>
          <Route path={'import'} element={<h2>Import</h2>} />;
          <Route path={'settings'} element={<h2>Settings</h2>} />;
          <Route path={'action'} element={<h2>Extrinsics</h2>} />;
          <Route path={'openGov'} element={<h2>OpenGov</h2>} />;
        </Routes>
      </HashRouter>
    </MainInterfaceWrapper>
  );
}
