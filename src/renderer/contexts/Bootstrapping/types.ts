// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface BootstrappingInterface {
  appLoading: boolean;
  isAborting: boolean;
  isConnecting: boolean;
  online: boolean;
  dockToggled: boolean;
  silenceOsNotifications: boolean;
  setSilenceOsNotifications: (b: boolean) => void;
  handleDockedToggle: () => void;
  handleToggleSilenceOsNotifications: () => void;
  setAppLoading: (b: boolean) => void;
  setIsAborting: (b: boolean) => void;
  setIsConnecting: (b: boolean) => void;
  setOnline: (b: boolean) => void;
  handleInitializeApp: () => Promise<void>;
  handleInitializeAppOffline: () => Promise<void>;
  handleInitializeAppOnline: () => Promise<void>;
}
