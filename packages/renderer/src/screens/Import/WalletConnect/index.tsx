// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffect, useState } from 'react';
import { Import } from './Import';
import { useAddresses } from '@ren/contexts/import';
import { Manage } from './Manage';

interface ImportWalletConnectProps {
  setSection: React.Dispatch<React.SetStateAction<number>>;
}

export const ImportWalletConnect = ({
  setSection,
}: ImportWalletConnectProps) => {
  const { getAccounts } = useAddresses();
  const genericAccounts = getAccounts('wallet-connect');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showImportUi, setShowImportUi] = useState<boolean>(
    genericAccounts.length === 0
  );

  /**
   * Show the WalletConnect import screen if no WalletConnect addresses have
   * been imported.
   */
  useEffect(() => {
    setShowImportUi(genericAccounts.length === 0);
  }, [genericAccounts]);

  if (!showImportUi) {
    return <Manage setSection={setSection} setShowImportUi={setShowImportUi} />;
  } else {
    return <Import setSection={setSection} setShowImportUi={setShowImportUi} />;
  }
};
