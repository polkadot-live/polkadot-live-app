// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type { ComponentBase } from '../../../types';
import type { AnyData } from '@polkadot-live/types/misc';

export type HardwareAddressProps = ComponentBase & {
  // The address to import.
  address: string;
  // Chain ID for address.
  chainId: ChainID;
  // Account processing status.
  processingStatus: boolean | null;
  // App's connection status.
  isConnected: boolean;
  // Whether this address is imported in main window.
  isImported: boolean;
  // Current name of the account.
  accountName: string;
  // Theme object.
  theme: AnyData;
  // Handle rename.
  renameHandler: (newName: string) => Promise<void>;
  // Handle remove UI.
  openRemoveHandler: () => void;
  // Handle confirm import UI.
  openConfirmHandler: () => void;
  // Handle confirm delete UI.
  openDeleteHandler: () => void;
  // Handle rename success.
  onRenameSuccess: (message: string, toastId: string) => void;
  // Handle rename error.
  onRenameError: (message: string, toastId: string) => void;
};
