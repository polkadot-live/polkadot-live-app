// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useDebug } from '@ren/hooks/useDebug';
import { useTabs } from '@polkadot-live/contexts';
import { Tabs } from '@polkadot-live/ui/components';
import { ResizeToggles } from './ResizeToggles';

export const TabsWrapper = () => {
  useDebug(window.myAPI.getWindowId());
  const tabsCtx = useTabs();
  return (
    <Tabs
      tabsCtx={tabsCtx}
      leftButtons={<ResizeToggles />}
      onCloseWindow={() => {
        const windowId = window.myAPI.getWindowId();
        window.myAPI.closeWindow(windowId);
      }}
    />
  );
};
