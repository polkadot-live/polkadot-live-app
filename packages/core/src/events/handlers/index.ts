// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  getBalancesPalletScopedAccountsFromEvent,
  handleBalancesEvent,
} from './balances';
import {
  getConvictionVotingPalletScopedAccountsFromEvent,
  handleConvictionVotingEvent,
} from './convictionVoting';
import {
  getNominationPoolsPalletScopedAccountsFromEvent,
  handleNominationPoolsEvent,
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
import type { WhoMeta } from '../types';

export const PalletHandlers: Record<string, AnyData> = {
  Balances: (
    chainId: ChainID,
    osNotify: boolean,
    palletEvent: PalletBalancesEvent,
    whoMeta?: WhoMeta,
  ) => handleBalancesEvent(chainId, osNotify, palletEvent, whoMeta),
  ConvictionVoting: (
    chainId: ChainID,
    osNotify: boolean,
    palletEvent: PalletConvictionVotingEvent,
    whoMeta?: WhoMeta,
  ) => handleConvictionVotingEvent(chainId, osNotify, palletEvent, whoMeta),
  NominationPools: (
    chainId: ChainID,
    osNotify: boolean,
    palletEvent: PalletNominationPoolsEvent,
    whoMeta?: WhoMeta,
  ) => handleNominationPoolsEvent(chainId, osNotify, palletEvent, whoMeta),
  Referenda: (
    chainId: ChainID,
    osNotify: boolean,
    palletEvent: PalletReferendaEvent,
    whoMeta?: WhoMeta,
  ) => handleReferendaEvent(chainId, osNotify, palletEvent, whoMeta),
  Staking: (
    chainId: ChainID,
    osNotify: boolean,
    palletEvent: PalletStakingEvent,
    whoMeta?: WhoMeta,
  ) => handleStakingEvent(chainId, osNotify, palletEvent, whoMeta),
};

export const ScopedAccountGetters: Record<string, AnyData> = {
  Balances: (chainId: ChainID, palletEvent: PalletBalancesEvent) =>
    getBalancesPalletScopedAccountsFromEvent(chainId, palletEvent),
  ConvictionVoting: (
    chainId: ChainID,
    palletEvent: PalletConvictionVotingEvent,
  ) => getConvictionVotingPalletScopedAccountsFromEvent(chainId, palletEvent),
  NominationPools: (
    chainId: ChainID,
    palletEvent: PalletNominationPoolsEvent,
  ) => getNominationPoolsPalletScopedAccountsFromEvent(chainId, palletEvent),
  Staking: (chainId: ChainID, palletEvent: PalletStakingEvent) =>
    getStakingPalletScopedAccountsFromEvent(chainId, palletEvent),
};
