// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffect, useState } from 'react';
import { useHelp } from '@polkadot-live/ui/contexts';
import { Help } from '@polkadot-live/ui/components';
import { MainInterfaceWrapper } from '@polkadot-live/styles/wrappers';
import { ToastContainer } from 'react-toastify';
import type { SettingKey } from '@polkadot-live/types/settings';
import './App.scss';

export default function App() {
  const { status: helpStatus, definition, closeHelp, setStatus } = useHelp();

  // TODO: Lift to context.
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const onMount = async () => {
      const key: SettingKey = 'setting:dark-mode';
      const data = { type: 'db', store: 'settings', key };
      const res: boolean | undefined = await chrome.runtime.sendMessage(data);
      setTheme(res === undefined ? 'dark' : res ? 'dark' : 'light');
    };
    onMount();
  }, []);

  const onOpenTab = () => {
    const url = chrome.runtime.getURL('src/tab/index.html');
    chrome.tabs.create({ url });
  };

  return (
    <MainInterfaceWrapper className={`theme-polkadot-relay theme-${theme}`}>
      <Help
        status={helpStatus}
        definition={definition}
        closeHelp={closeHelp}
        setStatus={setStatus}
      />
      <ToastContainer stacked />
      <div className="placeholder container">
        <h1>Polkadot Live</h1>
        <h2>{theme}</h2>
        <button onClick={onOpenTab}>Open Tab</button>
      </div>
    </MainInterfaceWrapper>
  );
}
