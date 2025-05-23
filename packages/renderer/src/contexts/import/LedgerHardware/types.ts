// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { LedgerResponse } from '@polkadot-live/types/ledger';
import type { AnyData } from '@polkadot-live/types/misc';

export interface RawLedgerAddress {
  address: string;
  pubKey: string;
  device: { id: string; productName: string };
  options: AnyData;
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
  statusCodes: LedgerResponse[];
  clearCaches: (
    clearReceived: boolean,
    clearSelected: boolean,
    clearStatusCodes: boolean
  ) => void;
  disableConnect: () => boolean;
  fetchLedgerAddresses: (network: string, offset: number) => void;
  getChecked: (pk: string) => boolean;
  getImportLabel: () => string;
  resetAll: () => void;
  setIsImporting: React.Dispatch<React.SetStateAction<boolean>>;
  setPageIndex: React.Dispatch<React.SetStateAction<number>>;
  setSelectedNetwork: (network: string) => void;
  updateSelectedAddresses: (
    checked: boolean,
    pk: string,
    accountName: string
  ) => void;
}
