// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only


import type { ComponentBase } from '@/renderer/types';
import type { ReactNode } from 'react';

export type HardwareAddressProps = ComponentBase & {
  // the address to import.
  address: string;
  // the index of the address.
  index: number;
  // initial value of address.
  initial: string;
  // whether to disable editing if address is imported.
  disableEditIfImported?: boolean;
  // identicon of address.
  Identicon: ReactNode;
  // handle rename
  renameHandler: (address: string, newName: string) => void;
  // handle whether address already exists.
  existsHandler: (address: string) => boolean;
  // handle remove UI.
  openRemoveHandler: (address: string) => void;
  // handle confirm import UI.
  openConfirmHandler: (address: string, index: number) => void;
  // required component translations.
  t: {
    tImport: string;
    tRemove: string;
  };
};
