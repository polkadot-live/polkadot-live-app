// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  handleBalancesEvent,
  getBalancesPalletScopedAccountsFromEvent,
} from './balances';
import {
  handleConvictionVotingEvent,
  getConvictionVotingPalletScopedAccountsFromEvent,
} from './convictionVoting';
import {
  handleNominationPoolsEvent,
  getNominationPoolsPalletScopedAccountsFromEvent,
} from './nominationPools';
import { handleReferendaEvent } from './referenda';
import {
  getStakingPalletScopedAccountsFromEvent,
  handleStakingEvent,
} from './staking';
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

export const ScopedAccountGetters: Record<string, AnyData> = {
  Balances: (chainId: ChainID, palletEvent: PalletBalancesEvent) =>
    getBalancesPalletScopedAccountsFromEvent(chainId, palletEvent),
  ConvictionVoting: (
    chainId: ChainID,
    palletEvent: PalletConvictionVotingEvent
  ) => getConvictionVotingPalletScopedAccountsFromEvent(chainId, palletEvent),
  NominationPools: (
    chainId: ChainID,
    palletEvent: PalletNominationPoolsEvent
  ) => getNominationPoolsPalletScopedAccountsFromEvent(chainId, palletEvent),
  Staking: (chainId: ChainID, palletEvent: PalletStakingEvent) =>
    getStakingPalletScopedAccountsFromEvent(chainId, palletEvent),
};
