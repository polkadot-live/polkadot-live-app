// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useState } from 'react';
import { Import } from './Import';

interface ImportWalletConnectProps {
  setSection: React.Dispatch<React.SetStateAction<number>>;
}

export const ImportWalletConnect = ({
  setSection,
}: ImportWalletConnectProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showImportUi, setShowImportUi] = useState<boolean>(true);

  return <Import setSection={setSection} setShowImportUi={setShowImportUi} />;
};
