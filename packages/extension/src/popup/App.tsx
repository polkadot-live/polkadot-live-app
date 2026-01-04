// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useConnections, useHelp } from '@polkadot-live/contexts';
import { Help } from '@polkadot-live/ui';
import {
  DialogClearEvents,
  DialogConnectChains,
  DialogEventData,
} from '@polkadot-live/screens';
import { MainInterfaceWrapper } from '@polkadot-live/styles';
import { ToastContainer } from 'react-toastify';
import { Home } from './screens';
import './App.scss';
import { ContextProxyMain } from './Proxy';

export default function App() {
  const { status: helpStatus, definition, closeHelp, setStatus } = useHelp();
  const { cacheGet } = useConnections();
  const theme = cacheGet('mode:dark') ? 'dark' : 'light';

  return (
    <MainInterfaceWrapper className={`theme-polkadot-relay theme-${theme}`}>
      <Help
        status={helpStatus}
        definition={definition}
        closeHelp={closeHelp}
        setStatus={setStatus}
      />
      <ToastContainer stacked />
      <ContextProxyMain>
        <DialogClearEvents />
        <DialogConnectChains />
        <DialogEventData />
        <Home />
      </ContextProxyMain>
    </MainInterfaceWrapper>
  );
}
