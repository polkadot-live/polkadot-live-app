// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Manage } from './Manage';
import { useAddresses } from '@/renderer/contexts/import/Addresses';
import type { AnyFunction } from '@w3ux/utils/types';

export const ImportReadOnly = ({
  section,
  setSection,
}: {
  section: number;
  setSection: AnyFunction;
}) => {
  // Get read-only addresses from local storage.
  const { readOnlyAddresses, setReadOnlyAddresses } = useAddresses();

  return (
    <Manage
      section={section}
      setSection={setSection}
      addresses={readOnlyAddresses}
      setAddresses={setReadOnlyAddresses}
    />
  );
};
