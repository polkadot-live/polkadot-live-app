// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ContextProxyTab, ContextProxyMain } from './Proxy';
import {
  MainInterfaceWrapper,
  TabViewWrapper,
} from '@polkadot-live/styles';
import { Overlay, Help } from '@polkadot-live/ui';
import { useDebug } from './hooks/useDebug';
import { useHelp, useOverlay, useTabs } from '@polkadot-live/contexts';
import { useEffect, useState } from 'react';
import { useTabsMessagePorts } from './hooks/useTabsMessagePorts';
import { HashRouter, Route, Routes } from 'react-router';
import {
  DialogClearEvents,
  DialogConnectChains,
  DialogEventData,
} from '@polkadot-live/screens';
import { FadeAction } from './screens/Action';
import { FadeImport } from './screens/Import';
import { FadeSettings } from './screens/Settings';
import { FadeOpenGov } from './screens/OpenGov';
import { Home } from './screens/Home';
import { ToastContainer } from 'react-toastify';
import { TabsWrapper } from './screens/Tabs';

interface VisitedTab {
  viewId: string;
  viewNode: React.ReactNode;
}

const RouteMain = () => (
  <ContextProxyMain>
    <DialogClearEvents />
    <DialogConnectChains />
    <DialogEventData />
    <Home />
  </ContextProxyMain>
);

const RouteTabs = () => {
  useTabsMessagePorts();
  useDebug(window.myAPI.getWindowId());

  // Lazy load tabs.
  const { tabsData, clickedId } = useTabs();
  const [visitedTabs, setVisitedTabs] = useState<VisitedTab[]>([]);

  const ViewFactory: Record<string, () => React.ReactNode> = {
    action: () => <FadeAction />,
    import: () => <FadeImport />,
    openGov: () => <FadeOpenGov />,
    settings: () => <FadeSettings />,
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
      <TabsWrapper />
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
    </ContextProxyTab>
  );
};

export const RouterInner = () => {
  const { status: helpStatus, definition, closeHelp, setStatus } = useHelp();
  const overlayCtx = useOverlay();

  const windowId = window.myAPI.getWindowId();
  const RouteElements: Record<string, () => React.ReactNode> = {
    main: () => <RouteMain />,
    tabs: () => <RouteTabs />,
  };

  return (
    <MainInterfaceWrapper>
      <Help
        status={helpStatus}
        definition={definition}
        closeHelp={closeHelp}
        setStatus={setStatus}
      />
      <Overlay overlayCtx={overlayCtx} />
      <ToastContainer stacked />
      <Routes>
        <Route path={'/'} element={RouteElements[windowId]()} />
      </Routes>
    </MainInterfaceWrapper>
  );
};

export const Router = () => {
  // Initialize analytics once.
  useEffect(() => {
    window.myAPI.initAnalytics(
      navigator.userAgent,
      window.myAPI.getWindowId(),
      navigator.language
    );
  }, []);

  return (
    <HashRouter basename="/">
      <RouterInner />
    </HashRouter>
  );
};

export default Router;
