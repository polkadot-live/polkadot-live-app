// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useState } from 'react';
import { Manage } from './Manage';
import { Splash } from './Splash';
import type { AnyFunction } from '@/types/misc';
import type { LocalAddress } from '@/types/accounts';
import { Config as ConfigImport } from '@/config/processes/import';

export const ImportVault = ({
  section,
  setSection,
}: {
  section: number;
  setSection: AnyFunction;
}) => {
  // Store addresses retreived from Polkadot Vault. Defaults to addresses saved in local storage.
  const [addresses, setAddressesState] = useState<LocalAddress[]>(() => {
    const key = ConfigImport.getStorageKey('vault');
    const fetched: string | null = localStorage.getItem(key);
    const parsed: LocalAddress[] = fetched !== null ? JSON.parse(fetched) : [];
    return parsed;
  });

  return !addresses.length ? (
    <Splash
      addresses={addresses}
      setAddresses={setAddressesState}
      setSection={setSection}
    />
  ) : (
    <Manage
      section={section}
      setSection={setSection}
      addresses={addresses}
      setAddresses={setAddressesState}
    />
  );
};
