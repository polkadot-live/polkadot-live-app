// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Manage } from './Manage';
import { Splash } from './Splash';
import { useImportAddresses } from '@polkadot-live/contexts';
import type { ImportVaultProps } from './types';

export const ImportVault = ({ section, setSection }: ImportVaultProps) => {
  const { getAccounts } = useImportAddresses();

  return !getAccounts('vault').length ? (
    <Splash setSection={setSection} />
  ) : (
    <Manage section={section} setSection={setSection} />
  );
};
