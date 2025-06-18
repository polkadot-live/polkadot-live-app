// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentBase } from '../../../types';
import type { AnyData } from '@polkadot-live/types/misc';
import type {
  EncodedAccount,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';

export type HardwareAddressProps = ComponentBase & {
  // The account to render.
  genericAccount: ImportedGenericAccount;
  // If any encoded accounts are processing.
  anyProcessing: boolean;
  isProcessing: (encodedAccount: EncodedAccount) => boolean;
  // App's connection status.
  isConnected: boolean;
  // Theme object.
  theme: AnyData;
  // Handle rename.
  renameHandler: (newName: string) => Promise<void>;
  // Handle remove UI.
  openRemoveHandler: (encodedAccount: EncodedAccount) => void;
  // Handle confirm import UI.
  openConfirmHandler: (encodedAccount: EncodedAccount) => void;
  // Handle confirm delete UI.
  openDeleteHandler: () => void;
  // Handle rename success.
  onRenameSuccess: (message: string, toastId: string) => void;
  // Handle rename error.
  onRenameError: (message: string, toastId: string) => void;
  // Handle clipboard copy.
  onClipboardCopy: (text: string) => Promise<void>;
};
