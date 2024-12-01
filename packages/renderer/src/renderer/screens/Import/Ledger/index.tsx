// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { setStateWithRef } from '@w3ux/utils';
import { useEffect, useRef, useState } from 'react';
import { useAddresses } from '@app/contexts/import/Addresses';
import { Manage } from './Manage';
import { Import } from './Import';
import type { LedgerResponse } from '@polkadot-live/types/ledger';
import type { ImportLedgerProps } from '../types';

export const ImportLedger = ({
  setSection /*, curSource*/,
}: ImportLedgerProps) => {
  /// Status entry is added for a newly imported account.
  const { ledgerAddresses: addresses } = useAddresses();

  /// Store whether import is in process
  const [isImporting, setIsImporting] = useState(false);
  const isImportingRef = useRef(isImporting);

  /// Store status codes received from Ledger device.
  const [statusCodes, setStatusCodes] = useState<LedgerResponse[]>([]);
  const statusCodesRef = useRef(statusCodes);

  const [showImportUi, setShowImportUi] = useState<boolean>(
    addresses.length === 0
  );

  /**
   * Show the Ledger import screen if no Ledger addresses have
   * been imported.
   */
  useEffect(() => {
    if (addresses.length === 0 && !showImportUi) {
      setShowImportUi(true);
    } else {
      setShowImportUi(false);
    }
  }, [addresses]);

  /**
   * Cancel ongoing import.
   */
  const cancelImport = () => {
    setStateWithRef(false, setIsImporting, isImportingRef);
    setStateWithRef([], setStatusCodes, statusCodesRef);
  };

  if (!showImportUi) {
    return (
      <Manage
        isImporting={isImporting}
        cancelImport={cancelImport}
        setSection={setSection}
        // TODO: Remove:
        toggleImport={() => false}
        statusCodes={[]}
      />
    );
  } else {
    return <Import setSection={setSection} setShowImportUi={setShowImportUi} />;
  }
};
