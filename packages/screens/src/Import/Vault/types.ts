// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AccountSource, LedgerMetadata } from '@polkadot-live/types';

export interface ImportVaultProps {
  section: number;
  setSection: React.Dispatch<React.SetStateAction<number>>;
}

export interface ManageVaultProps {
  setSection: React.Dispatch<React.SetStateAction<number>>;
  section: number;
}

export interface ReaderProps {
  handleImportAddress: (
    address: string,
    source: AccountSource,
    accountName?: string,
    ledgerMeta?: LedgerMetadata,
    showToast?: boolean
  ) => Promise<void>;
  isAlreadyImported: (targetPubKeyHex: string) => boolean;
  setOverlayStatus: (s: number) => void;
}

export interface VaultSplashProps {
  setSection: React.Dispatch<React.SetStateAction<number>>;
}
