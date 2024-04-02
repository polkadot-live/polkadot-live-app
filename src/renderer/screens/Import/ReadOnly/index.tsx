// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigImport } from '@/config/processes/import';
import { Manage } from './Manage';
import { useState } from 'react';
import type { AnyFunction } from '@w3ux/utils/types';
import type { LocalAddress } from '@/types/accounts';

export const ImportReadOnly = ({
  section,
  setSection,
}: {
  section: number;
  setSection: AnyFunction;
}) => {
  // Get read-only addresses from local storage.
  const [addresses, setAddressesState] = useState<LocalAddress[]>(() => {
    const key = ConfigImport.getStorageKey('read-only');
    const fetched: string | null = localStorage.getItem(key);
    const parsed: LocalAddress[] = fetched !== null ? JSON.parse(fetched) : [];
    return parsed;
  });

  return (
    <Manage
      section={section}
      setSection={setSection}
      addresses={addresses}
      setAddresses={setAddressesState}
    />
  );
};
