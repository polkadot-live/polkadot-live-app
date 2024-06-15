// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import type { ChainID } from '@/types/chains';
import type { ActiveReferendaInfo } from '@/types/openGov';
import type {
  PolkassemblyContextInterface,
  PolkassemblyProposal,
} from './types';

export const PolkassemblyContext = createContext<PolkassemblyContextInterface>(
  defaults.defaultPolkassemblyContext
);

export const usePolkassembly = () => useContext(PolkassemblyContext);

export const PolkassemblyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [usePolkassemblyApi, setUsePolkassemblyApi] = useState<boolean>(false);

  useEffect(() => {
    const fetchSetting = async () => {
      const { appEnablePolkassemblyApi } = await window.myAPI.getAppSettings();
      setUsePolkassemblyApi(appEnablePolkassemblyApi);
    };

    fetchSetting();
  }, []);

  const [proposals, setProposals] = useState<PolkassemblyProposal[]>([]);
  const [fetchingProposals, setFetchingProposals] = useState(false);
  const proposalsRef = useRef<PolkassemblyProposal[]>([]);

  /// Fetch proposal data after referenda have been loaded in referenda context.
  const fetchProposals = async (
    chainId: ChainID,
    referenda: ActiveReferendaInfo[]
  ) => {
    setFetchingProposals(true);

    // Create Axios instance with base URL to Polkassembly API.
    const axiosApi = axios.create({
      baseURL: `https://api.polkassembly.io/api/v1/`,
    });

    // Header requires `polkadot` or `kusama`.
    const network = (chainId as string).toLowerCase();

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

    // Store fetched proposals in state and render in OpenGov window.
    const collection: PolkassemblyProposal[] = [];

    for (const response of results) {
      const { content, post_id, status, title } = response.data;
      collection.push({ title, postId: post_id, content, status });
    }

    // Set context state.
    setProposals([...collection]);
    setFetchingProposals(false);
    proposalsRef.current = [...collection];
  };

  /// Get polkassembly proposal via referendum id.
  const getProposal = (referendumId: number): PolkassemblyProposal | null =>
    proposals.find(({ postId }) => postId === referendumId) || null;

  return (
    <PolkassemblyContext.Provider
      value={{
        proposals,
        getProposal,
        fetchProposals,
        fetchingProposals,
        usePolkassemblyApi,
        setUsePolkassemblyApi,
      }}
    >
      {children}
    </PolkassemblyContext.Provider>
  );
};
