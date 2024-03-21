// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ComponentBase } from '@/renderer/types';

export type HardwareAddressProps = ComponentBase & {
  // the address to import.
  address: string;
  // the index of the address.
  index: number;
  // Whether this address is imported in main window.
  isImported: boolean;
  // current name of the account.
  accountName: string;
  // handle rename
  renameHandler: (address: string, newName: string) => void;
  // handle remove UI.
  openRemoveHandler: () => void;
  // handle confirm import UI.
  openConfirmHandler: () => void;
  // handle confirm delete UI.
  openDeleteHandler: () => void;
};
