// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface AppSettingsContextInterface {
  dockToggled: boolean;
  silenceOsNotifications: boolean;
  showDebuggingSubscriptions: boolean;
  enableAutomaticSubscriptions: boolean;
  enablePolkassemblyApi: boolean;
  setSilenceOsNotifications: (b: boolean) => void;
  handleDockedToggle: () => void;
  handleToggleSilenceOsNotifications: () => void;
  handleToggleShowDebuggingSubscriptions: () => void;
  handleToggleEnableAutomaticSubscriptions: () => void;
  handleToggleEnablePolkassemblyApi: () => void;
  handleToggleKeepOutdatedEvents: () => void;
}
