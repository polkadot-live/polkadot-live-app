// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface AppSettingsContextInterface {
  dockToggled: boolean;
  silenceOsNotifications: boolean;
  silenceExtrinsicsOsNotifications: boolean;
  showDebuggingSubscriptions: boolean;
  enableAutomaticSubscriptions: boolean;
  enablePolkassemblyApi: boolean;
  hideDockIcon: boolean;
  sideNavCollapsed: boolean;
  setSilenceOsNotifications: (b: boolean) => void;
  handleToggleSilenceExtrinsicOsNotifications: () => void;
  handleDockedToggle: () => void;
  handleToggleSilenceOsNotifications: () => void;
  handleToggleShowDebuggingSubscriptions: () => void;
  handleToggleEnableAutomaticSubscriptions: () => void;
  handleToggleEnablePolkassemblyApi: () => void;
  handleToggleKeepOutdatedEvents: () => void;
  handleToggleHideDockIcon: () => void;
  handleSideNavCollapse: () => void;
}
