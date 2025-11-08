// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  useConnections,
  useHelp,
  useOverlay,
  useTabs,
} from '@polkadot-live/contexts';
import { Help, Overlay, Tabs } from '@polkadot-live/ui/components';
import { Action, Import, OpenGov, Settings } from '@polkadot-live/screens';
import { MainInterfaceWrapper } from '@polkadot-live/styles/wrappers';
import { ToastContainer } from 'react-toastify';
import { useEffect, useState } from 'react';
import { ContextProxyTab } from './Proxy';
import './App.scss';

export const RouterInner = () => {
  // Lazy load tabs.
  const { tabsData, clickedId } = useTabs();
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set([]));

  useEffect(() => {
    if (clickedId) {
      const tab = tabsData.find((t) => t.id === clickedId);
      if (tab) {
        const { viewId } = tab;
        setVisitedTabs((prev) => new Set([...prev, viewId]));
      }
    }
  }, [clickedId]);

  const renderView = (viewId: string) => {
    switch (viewId) {
      case 'action':
        return <Action />;
      case 'import':
        return <Import />;
      case 'openGov':
        return <OpenGov />;
      case 'settings':
        return <Settings platform={'chrome'} />;
    }
  };

  return (
    <ContextProxyTab>
      <Tabs tabsCtx={useTabs()} />
      {tabsData
        .filter((tab) => visitedTabs.has(tab.viewId))
        .map((tab) => (
          <div
            key={tab.id}
            style={{
              width: '100%',
              height: '100%',
              display: clickedId === tab.id ? 'block' : 'none',
            }}
          >
            {renderView(tab.viewId)}
          </div>
        ))}
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
      <RouterInner />
    </MainInterfaceWrapper>
  );
}
