// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Tabs } from '@polkadot-live/screens';
import { ResizeToggles } from './ResizeToggles';

export const TabsWrapper = () => (
  <Tabs
    leftButtons={<ResizeToggles />}
    onCloseWindow={() => {
      const windowId = window.myAPI.getWindowId();
      window.myAPI.closeWindow(windowId);
    }}
  />
);
