// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface ConnectionsContextInterface {
  isConnected: boolean;
  setIsConnected: (flag: boolean) => void;
}