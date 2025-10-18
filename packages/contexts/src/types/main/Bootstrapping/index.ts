// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface BootstrappingInterface {
  appLoading: boolean;
  isAborting: boolean;
  isConnecting: boolean;
  setAppLoading: (b: boolean) => void;
  setIsAborting: (b: boolean) => void;
  setIsConnecting: (b: boolean) => void;
  handleInitializeApp: () => Promise<void>;
  handleInitializeAppOffline: () => Promise<void>;
  handleInitializeAppOnline: () => Promise<void>;
  syncOpenGovWindow: () => Promise<void>;
}
