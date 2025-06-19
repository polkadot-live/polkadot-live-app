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
  // Handle rename.
  DialogRename: (props: {
    genericAccount: ImportedGenericAccount;
  }) => JSX.Element;
  // If a particular encoded account is processing.
  isProcessing: (encodedAccount: EncodedAccount) => boolean;
  // Handle clipboard copy.
  onClipboardCopy: (text: string) => Promise<void>;
  // Handle confirm import UI.
  openConfirmHandler: (encodedAccount: EncodedAccount) => void;
  // Handle confirm delete UI.
  openDeleteHandler: () => void;
  // Handle remove UI.
  openRemoveHandler: (encodedAccount: EncodedAccount) => void;
};
