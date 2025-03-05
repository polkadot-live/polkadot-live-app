// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { Config as ConfigOpenGov } from '@ren/config/processes/openGov';
import { createContext, useContext, useRef, useState } from 'react';
import { getOrderedOrigins } from '@app/utils/openGovUtils';
import { useConnections } from '@app/contexts/common/Connections';
import { usePolkassembly } from '../Polkassembly';
import { setStateWithRef } from '@w3ux/utils';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ReferendaContextInterface } from './types';
import type { ActiveReferendaInfo } from '@polkadot-live/types/openGov';

export const ReferendaContext = createContext<ReferendaContextInterface>(
  defaults.defaultReferendaContext
);

export const useReferenda = () => useContext(ReferendaContext);

export const ReferendaProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { getOnlineMode } = useConnections();
  const { fetchProposals, setUsePolkassemblyApi } = usePolkassembly();

  // Referenda data received from API.
  const [referendaMap, setReferendaMap] = useState(
    new Map<ChainID, ActiveReferendaInfo[]>()
  );

  // Flag to indicate that referenda are being fetched.
  const [fetchingReferenda, setFetchingReferenda] = useState(false);

  // Chain ID for currently rendered referenda.
  const [activeReferendaChainId, setActiveReferendaChainId] =
    useState<ChainID>('Polkadot');
  const activeReferendaChainRef = useRef(activeReferendaChainId);

  // Initiate feching referenda data.
  const fetchReferendaData = (chainId: ChainID) => {
    setStateWithRef(
      chainId,
      setActiveReferendaChainId,
      activeReferendaChainRef
    );

    // Fetch referenda if cached data doesn't exist for the chain.
    if (getOnlineMode() && !referendaMap.has(chainId)) {
      setFetchingReferenda(true);
      ConfigOpenGov.portOpenGov.postMessage({
        task: 'openGov:referenda:get',
        data: { chainId },
      });
    }
  };

  // Re-fetch referenda, called when user clicks refresh button.
  const refetchReferenda = () => {
    setFetchingReferenda(true);
    ConfigOpenGov.portOpenGov.postMessage({
      task: 'openGov:referenda:get',
      data: { chainId: activeReferendaChainId },
    });
  };

  // Set state after receiving referenda data from main renderer.
  const receiveReferendaData = async (info: ActiveReferendaInfo[]) => {
    setReferendaMap((pv) => pv.set(activeReferendaChainRef.current, info));

    // Get Polkassembly enabled setting.
    const { appEnablePolkassemblyApi } = await window.myAPI.getAppSettings();
    setUsePolkassemblyApi(appEnablePolkassemblyApi);

    // Fetch proposal metadata if Polkassembly enabled.
    if (appEnablePolkassemblyApi) {
      await fetchProposals(activeReferendaChainRef.current, info);
    }

    setFetchingReferenda(false);
  };

  // Get all referenda sorted by desc or asc.
  const getSortedActiveReferenda = (
    desc: boolean,
    otherReferenda?: ActiveReferendaInfo[]
  ) => {
    const sortFn = (info: ActiveReferendaInfo[]) =>
      info.sort((a, b) =>
        desc ? b.referendaId - a.referendaId : a.referendaId - b.referendaId
      );

    const referenda = referendaMap.get(activeReferendaChainRef.current);
    return otherReferenda
      ? sortFn(otherReferenda)
      : referenda
        ? sortFn(referenda)
        : [];
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
    const referenda = referendaMap.get(activeReferendaChainRef.current);
    const dataSet = otherReferenda || referenda || [];

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

  /// Update the fetched flag state and ref.
  const updateHasFetchedReferenda = (chainId: ChainID) => {
    if (chainId !== activeReferendaChainId) {
      setActiveReferendaChainId(chainId);
    }
  };

  return (
    <ReferendaContext.Provider
      value={{
        activeReferendaChainId,
        fetchingReferenda,
        referendaMap,
        fetchReferendaData,
        refetchReferenda,
        receiveReferendaData,
        setReferendaMap,
        setFetchingReferenda,
        getSortedActiveReferenda,
        getCategorisedReferenda,
        updateHasFetchedReferenda,
      }}
    >
      {children}
    </ReferendaContext.Provider>
  );
};
