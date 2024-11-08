// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { Config as ConfigOpenGov } from '@/config/processes/openGov';
import { createContext, useContext, useRef, useState } from 'react';
import { getOrderedOrigins } from '@/renderer/utils/openGovUtils';
import { useConnections } from '@app/contexts/common/Connections';
import { usePolkassembly } from '../Polkassembly';
import type { ChainID } from '@/types/chains';
import type { ReferendaContextInterface } from './types';
import type { ActiveReferendaInfo } from '@/types/openGov';

export const ReferendaContext = createContext<ReferendaContextInterface>(
  defaults.defaultReferendaContext
);

export const useReferenda = () => useContext(ReferendaContext);

export const ReferendaProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isConnected } = useConnections();
  const { fetchProposals, setUsePolkassemblyApi } = usePolkassembly();

  /// Ref to indiciate if referenda data has been fetched.
  const dataCachedRef = useRef(false);

  /// Referenda data received from API.
  const [referenda, setReferenda] = useState<ActiveReferendaInfo[]>([]);

  /// Flag to indicate that referenda is being fetched.
  const [fetchingReferenda, setFetchingReferenda] = useState(false);

  /// Chain ID for currently rendered referenda.
  const [activeReferendaChainId, setActiveReferendaChainId] =
    useState<ChainID>('Polkadot');
  const activeReferendaChainRef = useRef(activeReferendaChainId);

  /// Initiate feching referenda data.
  const fetchReferendaData = (chainId: ChainID) => {
    // Return early if offline or data is already fetched for the chain.
    if (
      !isConnected ||
      (dataCachedRef.current === true && chainId === activeReferendaChainId)
    ) {
      return;
    }

    setActiveReferendaChainId(chainId);
    activeReferendaChainRef.current = chainId;
    setFetchingReferenda(true);

    ConfigOpenGov.portOpenGov.postMessage({
      task: 'openGov:referenda:get',
      data: { chainId },
    });
  };

  /// Re-fetch referenda, called when user clicks refresh button.
  const refetchReferenda = () => {
    setFetchingReferenda(true);
    ConfigOpenGov.portOpenGov.postMessage({
      task: 'openGov:referenda:get',
      data: { chainId: activeReferendaChainId },
    });
  };

  /// Set state after receiving referenda data from main renderer.
  const receiveReferendaData = async (info: ActiveReferendaInfo[]) => {
    setReferenda(info);

    // Get Polkassembly enabled setting.
    const { appEnablePolkassemblyApi } = await window.myAPI.getAppSettings();
    setUsePolkassemblyApi(appEnablePolkassemblyApi);

    // Fetch proposal metadata if Polkassembly enabled.
    if (appEnablePolkassemblyApi) {
      await fetchProposals(activeReferendaChainRef.current, info);
    }

    dataCachedRef.current = true;
    setFetchingReferenda(false);
  };

  /// Get all referenda sorted by desc or asc.
  const getSortedActiveReferenda = (
    desc: boolean,
    otherReferenda?: ActiveReferendaInfo[]
  ) => {
    const sortFn = (info: ActiveReferendaInfo[]) =>
      info.sort((a, b) =>
        desc ? b.referendaId - a.referendaId : a.referendaId - b.referendaId
      );

    return otherReferenda ? sortFn(otherReferenda) : sortFn(referenda);
  };

  /// Get categorized referenda, sorted desc or asc in each category.
  const getCategorisedReferenda = (
    desc: boolean,
    otherReferenda?: ActiveReferendaInfo[]
  ) => {
    const map = new Map<string, ActiveReferendaInfo[]>();

    // Insert keys into map in the desired order.
    for (const origin of getOrderedOrigins()) {
      map.set(origin, []);
    }

    // Populate map with referenda data.
    const dataSet = otherReferenda || referenda;

    for (const info of dataSet) {
      const originData = info.Ongoing.origin;
      const origin =
        'system' in originData
          ? String(originData.system)
          : String(originData.Origins);

      const state = map.get(origin) || [];
      state.push(info);
      map.set(origin, state);
    }

    // Remove keys with no referenda.
    for (const [origin, infos] of map.entries()) {
      if (!infos.length) {
        map.delete(origin);
      }
    }

    // Sort referenda in each origin according to `desc` argument.
    for (const [origin, infos] of map.entries()) {
      map.set(
        origin,
        infos.sort((a, b) =>
          desc ? b.referendaId - a.referendaId : a.referendaId - b.referendaId
        )
      );
    }

    return map;
  };

  return (
    <ReferendaContext.Provider
      value={{
        referenda,
        fetchingReferenda,
        activeReferendaChainId,
        fetchReferendaData,
        refetchReferenda,
        receiveReferendaData,
        setReferenda,
        setFetchingReferenda,
        getSortedActiveReferenda,
        getCategorisedReferenda,
      }}
    >
      {children}
    </ReferendaContext.Provider>
  );
};
