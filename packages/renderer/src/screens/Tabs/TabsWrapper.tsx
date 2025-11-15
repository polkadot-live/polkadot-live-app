// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useDebug } from '@ren/hooks/useDebug';
import { Tabs } from '@polkadot-live/screens';
import { ResizeToggles } from './ResizeToggles';

export const TabsWrapper = () => {
  useDebug(window.myAPI.getWindowId());
  return (
    <Tabs
      platform="electron"
      leftButtons={<ResizeToggles />}
      onCloseWindow={() => {
        const windowId = window.myAPI.getWindowId();
        window.myAPI.closeWindow(windowId);
      }}
    />
  );
};
