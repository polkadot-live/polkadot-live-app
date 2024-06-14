// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useEffect } from 'react';
import { useReferenda } from '../Referenda';
import axios from 'axios';
import type { PolkassemblyContextInterface } from './types';

export const PolkassemblyContext = createContext<PolkassemblyContextInterface>(
  defaults.defaultPolkassemblyContext
);

export const usePolkassembly = () => useContext(PolkassemblyContext);

export interface PolkassemblyProposal {
  title: string;
  postId: number;
  content: string;
  status: string;
}

export const PolkassemblyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { activeReferendaChainId, referenda, fetchingReferenda } =
    useReferenda();

  /// Fetch proposal data after referenda have been loaded in referenda context.
  useEffect(() => {
    if (fetchingReferenda) {
      return;
    }

    // Fetch proposal data using Polkassembly API.
    const fetchProposals = async () => {
      // Create Axios instance with base URL to Polkassembly API.
      const axiosApi = axios.create({
        baseURL: `https://api.polkassembly.io/api/v1/`,
      });

      // Header requires `polkadot` or `kusama`.
      const network = (activeReferendaChainId as string).toLowerCase();

      // Make asynchronous requests to Polkassembly API for each referenda.
      const results = await Promise.all(
        referenda.map(({ referendaId }) =>
          axiosApi.get(
            `/posts/on-chain-post?postId=${referendaId}&proposalType=referendums_v2`,
            {
              maxBodyLength: Infinity,
              headers: { 'x-network': network },
            }
          )
        )
      );

      // Store fetched state.
      for (const response of results) {
        const { title, post_id, status } = response.data;
        console.log(`${title}-${post_id}-${status}`);

        // TODO: Store fetched proposals in state and render in OpenGov window.
      }
    };

    fetchProposals();
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
