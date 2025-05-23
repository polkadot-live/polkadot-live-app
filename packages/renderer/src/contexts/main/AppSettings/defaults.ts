// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { AppSettingsContextInterface } from './types';

export const defaultAppSettingsContext: AppSettingsContextInterface = {
  dockToggled: true,
  silenceOsNotifications: false,
  silenceExtrinsicsOsNotifications: false,
  showDebuggingSubscriptions: false,
  enableAutomaticSubscriptions: true,
  enablePolkassemblyApi: true,
  hideDockIcon: false,
  sideNavCollapsed: false,
  setSilenceOsNotifications: (b) => {},
  handleDockedToggle: () => {},
  handleToggleSilenceOsNotifications: () => {},
  handleToggleSilenceExtrinsicOsNotifications: () => {},
  handleToggleShowDebuggingSubscriptions: () => {},
  handleToggleEnableAutomaticSubscriptions: () => {},
  handleToggleEnablePolkassemblyApi: () => {},
  handleToggleKeepOutdatedEvents: () => {},
  handleToggleHideDockIcon: () => {},
  handleSideNavCollapse: () => {},
};
