// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { WalletConnectImportContextInterface } from './types';

export const defaultWalletConnectImportContext: WalletConnectImportContextInterface =
  {
    isImporting: false,
    wcFetchedAddresses: [],
    wcNetworks: [],
    getSelectedAddresses: () => [],
    handleConnect: () => new Promise(() => {}),
    handleDisconnect: () => new Promise(() => {}),
    handleFetch: () => {},
    setWcFetchedAddresses: () => {},
    handleImportProcess: () => new Promise(() => {}),
    handleOpenCloseWcModal: () => new Promise(() => {}),
    setWcNetworks: () => {},
  };
