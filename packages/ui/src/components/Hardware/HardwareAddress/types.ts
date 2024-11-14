// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentBase } from '../../../types';
import type { AnyData } from '@polkadot-live/types/misc';

export type HardwareAddressProps = ComponentBase & {
  // The address to import.
  address: string;
  // Account processing status.
  processingStatus: boolean | null;
  // Address chain icon SVG.
  ChainIcon: AnyData;
  // App's connection status.
  isConnected: boolean;
  // Whether this address is imported in main window.
  isImported: boolean;
  // Current name of the account.
  accountName: string;
  // Handle rename
  renameHandler: (address: string, newName: string) => Promise<void>;
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
