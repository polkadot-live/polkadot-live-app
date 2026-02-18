// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  useConnections,
  useHelp,
  useOverlay,
  useTabs,
} from '@polkadot-live/contexts';
import {
  Action,
  Import,
  OpenGov,
  Settings,
  Tabs,
} from '@polkadot-live/screens';
import {
  FlexColumn,
  MainInterfaceWrapper,
  TabViewWrapper,
} from '@polkadot-live/styles';
import { Help, Overlay } from '@polkadot-live/ui';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { ContextProxyTab } from './Proxy';
import './App.scss';

interface VisitedTab {
  viewId: string;
  viewNode: React.ReactNode;
}

export const RouterInner = () => {
  // Lazy load tabs.
  const { tabsData, clickedId } = useTabs();
  const [visitedTabs, setVisitedTabs] = useState<VisitedTab[]>([]);

  const ViewFactory: Record<string, () => React.ReactNode> = {
    action: () => <Action />,
    import: () => <Import />,
    openGov: () => <OpenGov />,
    settings: () => <Settings platform={'chrome'} />,
  };

  useEffect(() => {
    if (clickedId) {
      const tab = tabsData.find((t) => t.id === clickedId);
      if (!tab) {
        return;
      }
      const { viewId } = tab;
      if (visitedTabs.find((t) => t.viewId === viewId)) {
        return;
      }
      const viewNode = ViewFactory[viewId]();
      setVisitedTabs((prev) => [...prev, { viewId, viewNode }]);
    }
  }, [clickedId]);

  const getTabId = (viewId: string): number =>
    tabsData.find((t) => t.viewId === viewId)?.id ?? -1;

  return (
    <ContextProxyTab>
      <FlexColumn $rowGap={'0'} style={{ height: '100vh', width: '100%' }}>
        <Tabs />
        {visitedTabs
          .map((t) => ({ ...t, tabId: getTabId(t.viewId) }))
          .filter((t) => t.tabId !== -1)
          .map(({ tabId, viewNode }) => (
            <TabViewWrapper
              key={tabId}
              className={clickedId === tabId ? 'ShowTabView' : 'HideTabView'}
            >
              {viewNode}
            </TabViewWrapper>
          ))}
      </FlexColumn>
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
