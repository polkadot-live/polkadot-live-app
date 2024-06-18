// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface WebsocketServerContextInterface {
  isListening: boolean;
  setIsListening: React.Dispatch<React.SetStateAction<boolean>>;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
}
