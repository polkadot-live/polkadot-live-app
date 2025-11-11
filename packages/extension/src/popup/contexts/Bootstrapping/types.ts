// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface BootstrappingInterface {
  appLoading: boolean;
  isAborting: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  initAppOffline: () => Promise<void>;
  initAppOnline: () => Promise<void>;
  setAppLoading: (b: boolean) => void;
  setIsAborting: (b: boolean) => void;
  setIsConnecting: (b: boolean) => void;
}
