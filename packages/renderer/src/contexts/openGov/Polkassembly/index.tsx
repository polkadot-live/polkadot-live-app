// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  PolkassemblyProposal,
  ReferendaInfo,
} from '@polkadot-live/types/openGov';
import type { PolkassemblyContextInterface } from './types';
import type { SettingKey } from '@polkadot-live/types/settings';

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
  const [fetchingMetadata, setFetchingMetadata] = useState<boolean>(false);

  useEffect(() => {
    const fetchSetting = async () => {
      const ser = await window.myAPI.getAppSettings();
      const array: [SettingKey, boolean][] = JSON.parse(ser);
      const map = new Map<SettingKey, boolean>(array);
      const flag = Boolean(map.get('setting:enable-polkassembly'));
      setUsePolkassemblyApi(flag);
    };

    fetchSetting();
  }, []);

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

    setFetchingMetadata(true);

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

  // Clear proposal data for a particular chain.
  const clearProposals = (chainId: ChainID) => {
    proposalsMap.set(chainId, []);
  };

  return (
    <PolkassemblyContext.Provider
      value={{
        usePolkassemblyApi,
        fetchingMetadata,
        clearProposals,
        getProposal,
        fetchProposals,
        setFetchingMetadata,
        setUsePolkassemblyApi,
      }}
    >
      {children}
    </PolkassemblyContext.Provider>
  );
};
