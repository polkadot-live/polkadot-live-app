// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Manage } from './Manage';
import { Splash } from './Splash';
import { useAddresses } from '@/renderer/contexts/import/Addresses';
import type { AnyFunction } from '@/types/misc';

export const ImportVault = ({
  section,
  setSection,
}: {
  section: number;
  setSection: AnyFunction;
}) => {
  const { vaultAddresses, setVaultAddresses } = useAddresses();

  return !vaultAddresses.length ? (
    <Splash
      addresses={vaultAddresses}
      setAddresses={setVaultAddresses}
      setSection={setSection}
    />
  ) : (
    <Manage
      section={section}
      setSection={setSection}
      addresses={vaultAddresses}
      setAddresses={setVaultAddresses}
    />
  );
};
