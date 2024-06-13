// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface AppSettingsContextInterface {
  dockToggled: boolean;
  silenceOsNotifications: boolean;
  showDebuggingSubscriptions: boolean;
  enableAutomaticSubscriptions: boolean;
  setSilenceOsNotifications: (b: boolean) => void;
  handleDockedToggle: () => void;
  handleToggleSilenceOsNotifications: () => void;
  handleToggleShowDebuggingSubscriptions: () => void;
  handleToggleEnableAutomaticSubscriptions: () => void;
}
