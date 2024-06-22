// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { SettingFlagsContextInterface } from './types';

export const defaultSettingFlagsContext: SettingFlagsContextInterface = {
  getSwitchState: (s) => true,
  handleSwitchToggle: (s) => {},
  setWindowDocked: (b) => {},
  setSilenceOsNotifications: (b) => {},
  setShowOnAllWorkspaces: (b) => {},
  renderToastify: (s, t) => {},
};
