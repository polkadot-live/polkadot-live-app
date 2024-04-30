// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface OnlineStatusInterface {
  appLoading: boolean;
  online: boolean;
  setAppLoading: (b: boolean) => void;
  setOnline: (b: boolean) => void;
  handleInitializeApp: () => Promise<void>;
  handleInitializeAppOffline: () => Promise<void>;
  handleInitializeAppOnline: () => Promise<void>;
}
