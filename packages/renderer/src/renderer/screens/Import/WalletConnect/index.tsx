// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEffect, useState } from 'react';
import { Import } from './Import';
import { useAddresses } from '@app/contexts/import/Addresses';
import { Manage } from './Manage';

interface ImportWalletConnectProps {
  setSection: React.Dispatch<React.SetStateAction<number>>;
}

export const ImportWalletConnect = ({
  setSection,
}: ImportWalletConnectProps) => {
  const { wcAddresses: addresses } = useAddresses();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showImportUi, setShowImportUi] = useState<boolean>(
    addresses.length === 0
  );

  /**
   * Show the WalletConnect import screen if no WalletConnect addresses have
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
