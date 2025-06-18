// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Manage } from './Manage';
import { Splash } from './Splash';
import { useAddresses } from '@ren/contexts/import';
import type { ImportVaultProps } from '../types';

export const ImportVault = ({ section, setSection }: ImportVaultProps) => {
  const { getAccounts } = useAddresses();
  const genericAccounts = getAccounts('vault');

  return !genericAccounts.length ? (
    <Splash setSection={setSection} />
  ) : (
    <Manage section={section} setSection={setSection} />
  );
};
