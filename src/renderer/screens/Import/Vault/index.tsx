// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Manage } from './Manage';
import { Splash } from './Splash';
import { useAddresses } from '@/renderer/contexts/import/Addresses';
import type { ImportVaultProps } from '../types';

export const ImportVault = ({ section, setSection }: ImportVaultProps) => {
  const { vaultAddresses } = useAddresses();

  return !vaultAddresses.length ? (
    <Splash setSection={setSection} />
  ) : (
    <Manage
      section={section}
      setSection={setSection}
      addresses={vaultAddresses}
    />
  );
};
