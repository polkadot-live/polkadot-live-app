// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { LedgerMetadata } from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';
import type { LedgerResponse } from '@polkadot-live/types/ledger';
import type { AnyData } from '@polkadot-live/types/misc';

export interface RawLedgerAddress {
  address: string;
  ledgerMeta: LedgerMetadata;
  options: AnyData;
  pubKey: string;
}

export type NamedRawLedgerAddress = RawLedgerAddress & {
  accountName: string;
};

export interface LedgerHardwareContextInterface {
  connectedNetwork: string;
  deviceConnected: boolean;
  isFetching: boolean;
  isImporting: boolean;
  pageIndex: number;
  receivedAddresses: RawLedgerAddress[];
  selectedAddresses: NamedRawLedgerAddress[];
  selectedNetworkState: string;
  lastStatusCode: LedgerResponse | null;
  clearCaches: (
    clearReceived: boolean,
    clearSelected: boolean,
    clearStatusCodes: boolean,
  ) => void;
  disableConnect: () => boolean;
  fetchLedgerAddresses: (network: ChainID, offset: number) => Promise<void>;
  getChecked: (pk: string) => boolean;
  getPublicKey: (address: string) => `0x${string}`;
  getImportLabel: () => string;
  resetAll: () => void;
  setIsImporting: React.Dispatch<React.SetStateAction<boolean>>;
  setPageIndex: React.Dispatch<React.SetStateAction<number>>;
  setSelectedNetwork: (network: string) => void;
  updateSelectedAddresses: (
    checked: boolean,
    pk: string,
    accountName: string,
  ) => void;
}
