// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  ConfigRenderer,
  APIsController,
  fetchCoreTreasuryInfo,
  fetchStatemintTreasuryInfo,
  fetchStatemineTreasuryInfo,
} from '@polkadot-live/core';
import { createContext } from 'react';
import { createSafeContextHook } from '@polkadot-live/contexts';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ClientTypes } from '@polkadot-live/types/apis';
import type { DedotClient } from 'dedot';
import type { IpcTreasuryInfo } from '@polkadot-live/types/treasury';
import type { TreasuryApiContextInterface } from '@polkadot-live/contexts';

export const TreasuryApiContext = createContext<
  TreasuryApiContextInterface | undefined
>(undefined);

export const useTreasuryApi = createSafeContextHook(
  TreasuryApiContext,
  'TreasuryApiContext'
);

export const TreasuryApiProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /**
   * @name handleInitTreasury
   * @summary Cast API to get treasury data for OpenGov window.
   */
  const handleInitTreasury = async (ev: MessageEvent) => {
    try {
      const { chainId }: { chainId: ChainID } = ev.data.data;
      const api = (
        await APIsController.getConnectedApiOrThrow(chainId)
      ).getApi();

      switch (chainId) {
        case 'Polkadot Asset Hub': {
          const castApi = api as DedotClient<ClientTypes['statemint']>;
          const [coreTreasuryInfo, statemintTreasuryInfo] = await Promise.all([
            fetchCoreTreasuryInfo(castApi, chainId),
            fetchStatemintTreasuryInfo(),
          ]);
          postTreasuryInfo({ coreTreasuryInfo, statemintTreasuryInfo });
          break;
        }
        case 'Kusama Asset Hub': {
          const castApi = api as DedotClient<ClientTypes['statemine']>;
          const [coreTreasuryInfo, statemineTreasuryInfo] = await Promise.all([
            fetchCoreTreasuryInfo(castApi, chainId),
            fetchStatemineTreasuryInfo(),
          ]);
          postTreasuryInfo({ coreTreasuryInfo, statemineTreasuryInfo });
          break;
        }
      }
    } catch (e) {
      console.error(e);
      postTreasuryInfo(null);
    }
  };

  /**
   * @name postTreasuryInfo
   * @summary Send treasury info to OpenGov view.
   */
  const postTreasuryInfo = (info: IpcTreasuryInfo | null) => {
    ConfigRenderer.portToTabs?.postMessage({
      task: 'openGov:treasury:set',
      data: info,
    });
  };

  return (
    <TreasuryApiContext value={{ handleInitTreasury }}>
      {children}
    </TreasuryApiContext>
  );
};
