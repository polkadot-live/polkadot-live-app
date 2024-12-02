// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyFunction } from '@polkadot-live/types/misc';
import type {
  AccountSource,
  LedgerLocalAddress,
} from '@polkadot-live/types/accounts';

export interface HomeProps {
  setSection: AnyFunction;
  setSource: AnyFunction;
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

export interface ImportLedgerProps {
  setSection: React.Dispatch<React.SetStateAction<number>>;
  curSource: AccountSource | null;
}

export interface ImportLedgerManageProps {
  isImporting: boolean;
  cancelImport: AnyFunction;
  setSection: AnyFunction;
  setShowImportUi: AnyFunction;
}

export interface LedgerAddressProps {
  localAddress: LedgerLocalAddress;
  setSection: AnyFunction;
}

export interface ManageReadOnlyProps {
  setSection: AnyFunction;
}
