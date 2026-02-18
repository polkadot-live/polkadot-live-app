// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useImportAddresses } from '@polkadot-live/contexts';
import { useEffect, useState } from 'react';
import { Import } from './Import';
import { Manage } from './Manage';
import type { ImportLedgerProps } from '../types';

export const ImportLedger = ({ setSection }: ImportLedgerProps) => {
  const { getAccounts } = useImportAddresses();
  const addresses = getAccounts('ledger');

  const [showImportUi, setShowImportUi] = useState<boolean>(
    addresses.length === 0,
  );

  /**
   * Show the Ledger import screen if no Ledger addresses have
   * been imported.
   */
  useEffect(() => {
    setShowImportUi(addresses.length === 0);
  }, [addresses]);

  if (!showImportUi) {
    return <Manage setSection={setSection} setShowImportUi={setShowImportUi} />;
  } else {
    return <Import setSection={setSection} setShowImportUi={setShowImportUi} />;
  }
};
