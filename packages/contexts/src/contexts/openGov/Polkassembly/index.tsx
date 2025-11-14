// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import axios from 'axios';
import { createContext, useEffect, useState } from 'react';
import { createSafeContextHook } from '../../../utils';
import { getPolkassemblyAdapter } from './adapters';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ProposalMeta, ReferendaInfo } from '@polkadot-live/types/openGov';
import type { PolkassemblyContextInterface } from '../../../types/openGov';

type ProposalsMap = Map<ChainID, Map<number /* postId */, ProposalMeta>>;

export const PolkassemblyContext = createContext<
  PolkassemblyContextInterface | undefined
>(undefined);

export const usePolkassembly = createSafeContextHook(
  PolkassemblyContext,
  'PolkassemblyContext'
);

export const PolkassemblyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const adapter = getPolkassemblyAdapter();
  const [proposalsMap, setProposalsMap] = useState<ProposalsMap>(new Map());
  const [usePolkassemblyApi, setUsePolkassemblyApi] = useState<boolean>(false);

  // Util to fetch a proposal's metadata.
  const fetchProposalMeta = async (
    chainId: ChainID,
    postId: number
  ): Promise<ProposalMeta> => {
    // Header requires `polkadot` or `kusama`.
    const network = chainId.startsWith('Polkadot') ? 'polkadot' : 'kusama';

    // Create Axios instance with base URL to Polkassembly API.
    const baseURL = 'https://api.polkassembly.io/api/v1/';
    const axiosApi = axios.create({ baseURL });
    const { data } = await axiosApi.get('/posts/on-chain-post', {
      params: { postId, proposalType: 'referendums_v2' },
      maxBodyLength: Infinity,
      headers: { 'x-network': network },
    });

    return {
      chainId,
      postId: data.post_id,
      title: data.title,
      status: data.status,
    };
  };

  // Fetch proposal data after referenda have been loaded in referenda context.
  const fetchProposals = async (
    chainId: ChainID,
    referenda: ReferendaInfo[]
  ) => {
    const cached = proposalsMap.get(chainId) || [];
    const cachedIds = new Set(Array.from(cached.keys()));
    const toFetch = referenda.filter((r) => !cachedIds.has(r.refId));
    if (toFetch.length === 0) {
      return;
    }
    for (const { refId } of toFetch) {
      fetchProposalMeta(chainId, refId)
        .then((meta) => {
          setProposalsMap((prev) => {
            const updatedChain = new Map(prev.get(chainId) ?? []);
            updatedChain.set(refId, meta);
            return new Map(prev).set(chainId, updatedChain);
          });
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  // Get proposal metadata via referendum id.
  const getProposal = (chainId: ChainID, refId: number): ProposalMeta | null =>
    proposalsMap.get(chainId)?.get(refId) ?? null;

  // Clear proposal data for a particular chain.
  const clearProposals = (chainId: ChainID) => {
    setProposalsMap((prev) => new Map(prev).set(chainId, new Map([])));
  };

  // Fetch app setting on mount.
  useEffect(() => {
    const fetchSetting = async () => {
      const flag = await adapter.fetchSetting();
      setUsePolkassemblyApi(flag);
    };
    fetchSetting();
  }, []);

  return (
    <PolkassemblyContext
      value={{
        usePolkassemblyApi,
        clearProposals,
        getProposal,
        fetchProposals,
        setUsePolkassemblyApi,
      }}
    >
      {children}
    </PolkassemblyContext>
  );
};
