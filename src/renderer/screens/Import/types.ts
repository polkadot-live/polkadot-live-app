// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData, AnyFunction, AnyJson } from '@/types/misc';
import type { Html5Qrcode } from 'html5-qrcode';
import type {
  AccountSource,
  LedgerLocalAddress,
  LocalAddress,
} from '@/types/accounts';
import type { LedgerResponse } from '@/types/ledger';

export interface HomeProps {
  setSection: AnyFunction;
  setSource: AnyFunction;
}

export interface SplashProps {
  setSection: AnyFunction;
  statusCodes?: AnyJson;
}

export interface ManageVaultProps {
  setSection: AnyFunction;
  section: number;
  addresses: LocalAddress[];
  setAddresses: AnyFunction;
}

export interface ReaderVaultProps {
  addresses: LocalAddress[];
}

export interface Html5QrScannerProps {
  fps: number;
  qrCodeSuccessCallback: (data: string | null) => void;
  qrCodeErrorCallback: (error: string) => void;
  html5QrCode: Html5Qrcode | null;
}

export interface ImportLedgerProps {
  section: number;
  setSection: React.Dispatch<React.SetStateAction<number>>;
  curSource: AccountSource | null;
}

export interface ImportLedgerManageProps {
  addresses: LedgerLocalAddress[];
  isImporting: boolean;
  statusCodes: LedgerResponse[];
  section: number;
  toggleImport: AnyFunction;
  cancelImport: AnyFunction;
  setSection: AnyFunction;
}

export interface LedgerAddressProps {
  accountName: string;
  address: string;
  source: AccountSource;
  index: number;
  isImported: boolean;
  orderData: {
    curIndex: number;
    lastIndex: number;
  };
  setSection: AnyFunction;
  pubKey: string;
  device: AnyData;
}

export interface ManageReadOnlyProps {
  setSection: AnyFunction;
}
