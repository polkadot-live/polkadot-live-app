// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyFunction } from '@polkadot-live/types/misc';
import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';

export interface HomeProps {
  setSection: AnyFunction;
  setSource: AnyFunction;
}

export interface ImportScreenProps {
  source: AccountSource | null;
  section: number;
  setSection: React.Dispatch<React.SetStateAction<number>>;
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
}

export interface ImportLedgerManageProps {
  setSection: React.Dispatch<React.SetStateAction<number>>;
  setShowImportUi: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface LedgerAddressProps {
  genericAccount: ImportedGenericAccount;
  setSection: React.Dispatch<React.SetStateAction<number>>;
}

export interface ManageReadOnlyProps {
  setSection: React.Dispatch<React.SetStateAction<number>>;
}
