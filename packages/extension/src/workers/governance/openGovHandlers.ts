// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  APIsController,
  fetchCoreTreasuryInfo,
  fetchProcessReferenda,
  fetchStatemineTreasuryInfo,
  fetchStatemintTreasuryInfo,
  getSerializedTracks,
} from '@polkadot-live/core';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ClientTypes } from '@polkadot-live/types/apis';
import type { DedotClient } from 'dedot';
import type { PalletReferendaTrackDetails } from '@dedot/chaintypes/substrate';
import type { ReferendaInfo } from '@polkadot-live/types/openGov';
import type { SerIpcTreasuryInfo } from '@polkadot-live/types/treasury';

export const handleInitTreasury = async (
  chainId: ChainID
): Promise<SerIpcTreasuryInfo | null> => {
  try {
    const api = (await APIsController.getConnectedApiOrThrow(chainId)).getApi();
    switch (chainId) {
      case 'Polkadot Relay': {
        const castApi = api as DedotClient<ClientTypes['polkadot']>;
        const [coreTreasuryInfo, statemintTreasuryInfo] = await Promise.all([
          fetchCoreTreasuryInfo(castApi, chainId),
          fetchStatemintTreasuryInfo(),
        ]);
        // Return serialized.
        const { usdcBalance, usdtBalance, dotBalance } = statemintTreasuryInfo;
        return {
          coreTreasuryInfo,
          serStatemintTreasuryInfo: {
            usdcBalance: usdcBalance.toString(),
            usdtBalance: usdtBalance.toString(),
            dotBalance: dotBalance.toString(),
          },
        };
      }
      case 'Kusama Asset Hub': {
        const castApi = api as DedotClient<ClientTypes['statemine']>;
        const [coreTreasuryInfo, statemineTreasuryInfo] = await Promise.all([
          fetchCoreTreasuryInfo(castApi, chainId),
          fetchStatemineTreasuryInfo(),
        ]);
        // Return serialized.
        const { ksmBalance } = statemineTreasuryInfo;
        return {
          coreTreasuryInfo,
          serStatemineTreasuryInfo: {
            ksmBalance: ksmBalance.toString(),
          },
        };
      }
    }
    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const handleFetchTracks = async (chainId: ChainID) => {
  try {
    const { api } = await APIsController.getConnectedApiOrThrow(chainId);
    if (!api) {
      throw Error('api is null');
    }
    type T = [number, PalletReferendaTrackDetails][];
    const tracks = api.consts.referenda.tracks;
    return getSerializedTracks(tracks as T);
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const handleFetchReferenda = async (
  chainId: ChainID
): Promise<ReferendaInfo[] | null> => {
  try {
    const client = await APIsController.getConnectedApiOrThrow(chainId);
    if (!client.api) {
      return null;
    }
    let referenda: ReferendaInfo[] = [];
    switch (chainId) {
      case 'Polkadot Relay': {
        const api = client.api as DedotClient<ClientTypes['polkadot']>;
        referenda = await fetchProcessReferenda(api);
        break;
      }
      case 'Kusama Asset Hub': {
        const api = client.api as DedotClient<ClientTypes['statemine']>;
        referenda = await fetchProcessReferenda(api);
        break;
      }
    }
    return referenda;
  } catch (e) {
    console.error(e);
    return null;
  }
};
