// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useHelp } from '@polkadot-live/ui/contexts';
import { Help } from '@polkadot-live/ui/components';
import { MainInterfaceWrapper } from '@polkadot-live/styles/wrappers';
import { ToastContainer } from 'react-toastify';
import { Home } from './screens';
import './App.scss';
import { useAppSettings } from './contexts';

export default function App() {
  const { status: helpStatus, definition, closeHelp, setStatus } = useHelp();
  const { cacheGet } = useAppSettings();
  const theme = cacheGet('setting:dark-mode') ? 'dark' : 'light';

  return (
    <MainInterfaceWrapper className={`theme-polkadot-relay theme-${theme}`}>
      <Help
        status={helpStatus}
        definition={definition}
        closeHelp={closeHelp}
        setStatus={setStatus}
      />
      <ToastContainer stacked />
      <Home />
    </MainInterfaceWrapper>
  );
}
