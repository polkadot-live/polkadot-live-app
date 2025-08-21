// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import BigNumber from 'bignumber.js';
import { ConfigRenderer, APIsController } from '@polkadot-live/core';
import { chainUnits } from '@polkadot-live/consts/chains';
import { concatU8a, encodeAddress, hexToU8a, stringToU8a } from 'dedot/utils';
import { createContext, useContext } from 'react';
import { planckToUnit } from '@w3ux/utils';
import { TreasuryAccounts } from '@polkadot-live/consts/treasury';

import type { ChainID } from '@polkadot-live/types/chains';
import type { DedotClient } from 'dedot';
import type { StatemintTreasuryInfo } from '@polkadot-live/types/treasury';
import type { TreasuryApiContextInterface } from './types';
import type {
  ClientTypes,
  DedotOpenGovClient,
} from '@polkadot-live/types/apis';

export const TreasuryApiContext = createContext<TreasuryApiContextInterface>(
  defaults.defaultTreasuryApiContext
);

export const useTreasuryApi = () => useContext(TreasuryApiContext);

export const TreasuryApiProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /**
   * @name fetchStatemintTreasuryInfo
   * @summary Fetch asset balances from the Polkadot Asset Hub treasury.
   */
  const fetchStatemintTreasuryInfo =
    async (): Promise<StatemintTreasuryInfo> => {
      const chainId: ChainID = 'Polkadot Asset Hub';
      const client = await APIsController.getConnectedApiOrThrow(chainId);
      const api = client.getApi() as DedotClient<ClientTypes['statemint']>;

      const treasury = TreasuryAccounts.get('Polkadot Asset Hub')!;
      const [usdcAccount, usdtAccount, dotAccount] = await api.queryMulti([
        { fn: api.query.assets.account, args: [[1337, treasury]] },
        { fn: api.query.assets.account, args: [[1984, treasury]] },
        { fn: api.query.system.account, args: [treasury] },
      ]);

      return {
        usdcBalance: usdcAccount?.balance || 0n,
        usdtBalance: usdtAccount?.balance || 0n,
        dotBalance: dotAccount.data.free,
      };
    };

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
        case 'Polkadot Relay': {
          await processInitTreasury(
            api as DedotClient<ClientTypes['polkadot']>,
            chainId
          );
          break;
        }
        case 'Kusama Relay': {
          await processInitTreasury(
            api as DedotClient<ClientTypes['kusama']>,
            chainId
          );
          break;
        }
      }
    } catch (e) {
      ConfigRenderer.portToOpenGov?.postMessage({
        task: 'openGov:treasury:set',
        data: null,
      });
    }
  };

  /**
   * @name processInitTreasury
   * @summary Use API to get treasury data for OpenGov window.
   */
  const processInitTreasury = async (
    api: DedotOpenGovClient,
    chainId: ChainID
  ) => {
    const publicKey = getTreasuryPublicKey(api);
    const free = await getFreeBalance(api, publicKey);
    const freeBalance: string = planckToUnit(free, chainUnits(chainId));
    const nextBurn = getNextBurn(api, chainId, free);
    const toBeAwarded = await getToBeAwarded(api, chainId);
    const spendPeriod = api.consts.treasury.spendPeriod;
    const spendPeriodElapsedBlocksAsStr = await getElapsedSpendPeriod(
      api,
      spendPeriod
    );

    const statemintTreasuryInfo =
      chainId === 'Polkadot Relay' ? await fetchStatemintTreasuryInfo() : null;

    ConfigRenderer.portToOpenGov?.postMessage({
      task: 'openGov:treasury:set',
      data: {
        freeBalance,
        nextBurn,
        toBeAwardedAsStr: toBeAwarded,
        spendPeriodAsStr: spendPeriod.toString(),
        spendPeriodElapsedBlocksAsStr,
        statemintTreasuryInfo,
      },
    });
  };

  /**
   * Utilities.
   */
  const getTreasuryPublicKey = (api: DedotOpenGovClient): Uint8Array => {
    const EMPTY_U8A_32 = new Uint8Array(32);
    const hexPalletId = api.consts.treasury.palletId;
    const u8aPalleId = hexPalletId
      ? hexToU8a(hexPalletId)
      : stringToU8a('py/trsry');

    const publicKey = concatU8a(
      stringToU8a('modl'),
      u8aPalleId,
      EMPTY_U8A_32
    ).subarray(0, 32);

    return publicKey;
  };

  const getFreeBalance = async (
    api: DedotOpenGovClient,
    publicKey: Uint8Array
  ): Promise<bigint> => {
    const prefix: number = api.consts.system.ss58Prefix;
    const encoded = encodeAddress(publicKey, prefix);
    const result = await api.query.system.account(encoded);
    const { free } = result.data;

    return free;
  };

  const getNextBurn = (
    api: DedotOpenGovClient,
    chainId: ChainID,
    free: bigint
  ): string => {
    const burn = api.consts.treasury.burn;
    const toBurn = new BigNumber(burn)
      .dividedBy(Math.pow(10, 6))
      .multipliedBy(new BigNumber(free.toString()));

    const nextBurn = planckToUnit(
      toBurn.toString(),
      chainUnits(chainId)
    ).toString();

    return nextBurn;
  };

  const getToBeAwarded = async (
    api: DedotOpenGovClient,
    chainId: ChainID
  ): Promise<string> => {
    const [approvals, proposals] = await Promise.all([
      api.query.treasury.approvals(),
      api.query.treasury.proposals.entries(),
    ]);

    let toBeAwarded = 0n;
    for (const [proposalId, proposalData] of proposals) {
      if (approvals.includes(proposalId)) {
        toBeAwarded += proposalData.value;
      }
    }

    const strToBeAwarded = planckToUnit(toBeAwarded, chainUnits(chainId));
    return strToBeAwarded;
  };

  const getElapsedSpendPeriod = async (
    api: DedotOpenGovClient,
    spendPeriod: number
  ) => {
    const lastHeader = await api.rpc.chain_getHeader();
    const dedotBlockHeight = lastHeader?.number;

    let spendPeriodElapsedBlocksAsStr = '0';
    if (dedotBlockHeight) {
      spendPeriodElapsedBlocksAsStr = new BigNumber(dedotBlockHeight)
        .mod(new BigNumber(spendPeriod))
        .toString();
    }

    return spendPeriodElapsedBlocksAsStr;
  };

  return (
    <TreasuryApiContext.Provider value={{ handleInitTreasury }}>
      {children}
    </TreasuryApiContext.Provider>
  );
};
