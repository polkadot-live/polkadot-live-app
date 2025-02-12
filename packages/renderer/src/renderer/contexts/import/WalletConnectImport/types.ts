// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  WcFetchedAddress,
  WcSelectNetwork,
} from '@polkadot-live/types/walletConnect';

export interface WalletConnectImportContextInterface {
  isImporting: boolean;
  wcFetchedAddresses: WcFetchedAddress[];
  wcNetworks: WcSelectNetwork[];
  getSelectedAddresses: () => WcFetchedAddress[];
  handleConnect: () => Promise<void>;
  handleDisconnect: () => Promise<void>;
  handleFetch: () => void;
  handleImportProcess: (
    setShowImportUi: React.Dispatch<React.SetStateAction<boolean>>
  ) => Promise<void>;
  setWcNetworks: React.Dispatch<React.SetStateAction<WcSelectNetwork[]>>;
  setWcFetchedAddresses: React.Dispatch<
    React.SetStateAction<WcFetchedAddress[]>
  >;
}
