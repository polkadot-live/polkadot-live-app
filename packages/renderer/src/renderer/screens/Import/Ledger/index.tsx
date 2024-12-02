// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffect, useState } from 'react';
import { useAddresses } from '@app/contexts/import/Addresses';
import { Manage } from './Manage';
import { Import } from './Import';
import type { ImportLedgerProps } from '../types';

export const ImportLedger = ({ setSection }: ImportLedgerProps) => {
  const { ledgerAddresses: addresses } = useAddresses();

  const [showImportUi, setShowImportUi] = useState<boolean>(
    addresses.length === 0
  );

  /**
   * Show the Ledger import screen if no Ledger addresses have
   * been imported.
   */
  useEffect(() => {
    addresses.length === 0 ? setShowImportUi(true) : setShowImportUi(false);
  }, [addresses]);

  if (!showImportUi) {
    return <Manage setSection={setSection} setShowImportUi={setShowImportUi} />;
  } else {
    return <Import setSection={setSection} setShowImportUi={setShowImportUi} />;
  }
};
