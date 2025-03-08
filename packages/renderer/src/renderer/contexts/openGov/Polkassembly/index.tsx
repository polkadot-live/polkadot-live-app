// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  PolkassemblyProposal,
  ReferendaInfo,
} from '@polkadot-live/types/openGov';
import type { PolkassemblyContextInterface } from './types';

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

  const proposalsRef = useRef<PolkassemblyProposal[]>([]);
  const [proposalsMap, setProposalsMap] = useState(
    new Map<ChainID, PolkassemblyProposal[]>()
  );

  // Fetch proposal data after referenda have been loaded in referenda context.
  const fetchProposals = async (
    chainId: ChainID,
    referenda: ReferendaInfo[]
  ) => {
    const cached = proposalsMap.get(chainId) || [];
    const cachedIds = cached.map(({ postId }) => postId);
    const filtered = referenda.filter(
      ({ refId }) => !cachedIds.includes(refId)
    );

    // Exit early if there's no data to fetch.
    if (filtered.length === 0) {
      return;
    }

    // Create Axios instance with base URL to Polkassembly API.
    const axiosApi = axios.create({
      baseURL: `https://api.polkassembly.io/api/v1/`,
    });

    // Header requires `polkadot` or `kusama`.
    const network = (chainId as string).toLowerCase();

    // Make asynchronous requests to Polkassembly API for each referenda.
    const results = await Promise.all(
      filtered.map(({ refId }) =>
        axiosApi.get(
          `/posts/on-chain-post?postId=${refId}&proposalType=referendums_v2`,
          {
            maxBodyLength: Infinity,
            headers: { 'x-network': network },
          }
        )
      )
    );

    // Store fetched proposals in state and render in OpenGov window.
    const fetched: PolkassemblyProposal[] = [];
    for (const response of results) {
      const { content, post_id, status, title } = response.data;
      fetched.push({ title, postId: post_id, content, status });
    }

    // Append fetched proposals to existing cached data.
    setProposalsMap((pv) => pv.set(chainId, [...cached, ...fetched]));
    proposalsRef.current = [...cached, ...fetched];
  };

  // Get polkassembly proposal via referendum id.
  const getProposal = (
    chainId: ChainID,
    referendumId: number
  ): PolkassemblyProposal | null =>
    proposalsMap.has(chainId)
      ? proposalsMap
          .get(chainId)!
          .find(({ postId }) => postId === referendumId) || null
      : null;

  return (
    <PolkassemblyContext.Provider
      value={{
        usePolkassemblyApi,
        getProposal,
        fetchProposals,
        setUsePolkassemblyApi,
      }}
    >
      {children}
    </PolkassemblyContext.Provider>
  );
};
