// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useEffect } from 'react';
import type { PolkassemblyContextInterface } from './types';
import { useReferenda } from '../Referenda';

export const PolkassemblyContext = createContext<PolkassemblyContextInterface>(
  defaults.defaultPolkassemblyContext
);

export const usePolkassembly = () => useContext(PolkassemblyContext);

export const PolkassemblyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { referenda, fetchingReferenda } = useReferenda();

  /// Fetch proposal data after referenda have been loaded in referenda context.
  useEffect(() => {
    if (fetchingReferenda) {
      return;
    }

    // TODO: Fetch proposal data using Polkassembly API.
    const referendaIds = referenda.map(({ referendaId }) => referendaId);
    console.log(referendaIds);
  }, [fetchingReferenda]);

  return (
    <PolkassemblyContext.Provider
      value={{
        proposals: null,
      }}
    >
      {children}
    </PolkassemblyContext.Provider>
  );
};
