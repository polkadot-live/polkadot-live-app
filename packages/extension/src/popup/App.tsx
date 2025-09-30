// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffect, useState } from 'react';
import './App.scss';
import type { SettingKey } from '@polkadot-live/types/settings';

export default function App() {
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
    <div className={`theme-polkadot-relay theme-${theme} container`}>
      <div className="placeholder">
        <h1>Polkadot Live Popup</h1>
        <h2>{theme}</h2>
        <button onClick={onOpenTab}>Open Tab</button>
      </div>
    </div>
  );
}
