// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { handleBalancesEvent } from './balances';
import { handleConvictionVotingEvent } from './convictionVoting';
import { handleNominationPoolsEvent } from './nominationPools';
import { handleReferendaEvent } from './referenda';
import { handleStakingEvent } from './staking';
import type {
  AnyData,
  PalletBalancesEvent,
  PalletConvictionVotingEvent,
  PalletNominationPoolsEvent,
  PalletReferendaEvent,
  PalletStakingEvent,
} from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';

export const PalletHandlers: Record<string, AnyData> = {
  Balances: (
    chainId: ChainID,
    osNotify: boolean,
    palletEvent: PalletBalancesEvent
  ) => handleBalancesEvent(chainId, osNotify, palletEvent),
  ConvictionVoting: (
    chainId: ChainID,
    osNotify: boolean,
    palletEvent: PalletConvictionVotingEvent
  ) => handleConvictionVotingEvent(chainId, osNotify, palletEvent),
  NominationPools: (
    chainId: ChainID,
    osNotify: boolean,
    palletEvent: PalletNominationPoolsEvent
  ) => handleNominationPoolsEvent(chainId, osNotify, palletEvent),
  Referenda: (
    chainId: ChainID,
    osNotify: boolean,
    palletEvent: PalletReferendaEvent
  ) => handleReferendaEvent(chainId, osNotify, palletEvent),
  Staking: (
    chainId: ChainID,
    osNotify: boolean,
    palletEvent: PalletStakingEvent
  ) => handleStakingEvent(chainId, osNotify, palletEvent),
};
