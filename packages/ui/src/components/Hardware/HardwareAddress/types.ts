// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentBase } from '../../../types';
import type { AnyData } from '@polkadot-live/types/misc';
import type {
  EncodedAccount,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';

export type HardwareAddressProps = ComponentBase & {
  // If any encoded accounts are processing.
  anyProcessing: boolean;
  // The account to render.
  genericAccount: ImportedGenericAccount;
  // App's connection status.
  isConnected: boolean;
  // Theme object.
  theme: AnyData;
  // If a particular encoded account is processing.
  isProcessing: (encodedAccount: EncodedAccount) => boolean;
  // Handle clipboard copy.
  onClipboardCopy: (text: string) => Promise<void>;
  // Handle adding subscriptions to main window.
  handleAddSubscriptions: (encodedAccount: EncodedAccount) => Promise<void>;
  // Handle removing subscriptions from main window.
  handleRemoveSubscriptions: (encodedAccount: EncodedAccount) => Promise<void>;
  // Handle show address click for an encoded account.
  handleShowAddressClick: (key: string) => void;
  // Handle confirm delete UI.
  openDeleteHandler: () => void;
  // Sets open flag for rename dialogs.
  setIsDialogOpen: (
    genericAccount: ImportedGenericAccount,
    flag: boolean
  ) => void;
  // Manage networks dialog component.
  DialogManageAccounts: React.ComponentType<{
    genericAccount: ImportedGenericAccount;
  }>;
};
