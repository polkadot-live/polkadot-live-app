// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyFunction, AnyJson } from '@/types/misc';
import type { Html5Qrcode } from 'html5-qrcode';
import type { AccountSource, LedgerLocalAddress } from '@/types/accounts';
import type { LedgerResponse } from '@/types/ledger';

export interface HomeProps {
  setSection: AnyFunction;
  setSource: AnyFunction;
}

export interface SplashProps {
  setSection: AnyFunction;
  statusCodes?: AnyJson;
}

export interface ImportVaultProps {
  section: number;
  setSection: React.Dispatch<React.SetStateAction<number>>;
}

export interface VaultSplashProps {
  setSection: React.Dispatch<React.SetStateAction<number>>;
}

export interface ManageVaultProps {
  setSection: React.Dispatch<React.SetStateAction<number>>;
  section: number;
}

export interface Html5QrScannerProps {
  fps: number;
  qrCodeSuccessCallback: (data: string | null) => void;
  qrCodeErrorCallback: (error: string) => void;
  html5QrCode: Html5Qrcode | null;
}

export interface ImportLedgerProps {
  setSection: React.Dispatch<React.SetStateAction<number>>;
  curSource: AccountSource | null;
}

export interface ImportLedgerManageProps {
  isImporting: boolean;
  statusCodes: LedgerResponse[];
  toggleImport: AnyFunction;
  cancelImport: AnyFunction;
  setSection: AnyFunction;
}

export interface LedgerAddressProps {
  localAddress: LedgerLocalAddress;
  setSection: AnyFunction;
}

export interface ManageReadOnlyProps {
  setSection: AnyFunction;
}
