// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyFunction, AnyJson } from '@/types/misc';
import type { Html5Qrcode } from 'html5-qrcode';
import type { LedgerLocalAddress, LocalAddress } from '@/types/accounts';
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
  setAddresses: AnyFunction;
}

export interface Html5QrScannerProps {
  fps: number;
  qrCodeSuccessCallback: (data: string | null) => void;
  qrCodeErrorCallback: (error: string) => void;
  html5QrCode: Html5Qrcode | null;
}

export interface ImportLedgerManageProps {
  addresses: LedgerLocalAddress[];
  isImporting: boolean;
  statusCodes: LedgerResponse[];
  section: number;
  setAddresses: AnyFunction;
  toggleImport: AnyFunction;
  cancelImport: AnyFunction;
  setSection: AnyFunction;
}

export interface LedgerAddressProps {
  accountName: string;
  address: string;
  index: number;
  isImported: boolean;
  setAddresses: AnyFunction;
  setSection: AnyFunction;
}
