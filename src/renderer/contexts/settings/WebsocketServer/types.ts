// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface WebsocketServerContextInterface {
  isListening: boolean;
  setIsListening: React.Dispatch<React.SetStateAction<boolean>>;
  startServer: () => Promise<void>;
  stopServer: () => Promise<void>;
}
