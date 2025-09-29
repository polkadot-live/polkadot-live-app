// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import './App.css';

export default function App() {
  const onOpenTab = () => {
    const url = chrome.runtime.getURL('src/tab/index.html');
    chrome.tabs.create({ url });
  };

  return (
    <div className="placeholder">
      <h1>Polkadot Live Popup</h1>
      <button onClick={onOpenTab}>Open Tab</button>
    </div>
  );
}
