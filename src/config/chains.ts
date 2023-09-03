// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import * as Sc from '@substrate/connect';
import { ChainID, AnyData } from '../types/index';
import PolkadotIcon from './svg/polkadotIcon.svg';
import PolkadotAppIcon from './svg/ledger/polkadot.svg';

interface Chain {
  icon: typeof import("*.svg"),
  ledger: {
    icon: typeof import("*.svg"),
  };
  endpoints: {
    rpc: string;
    lightClient: string;
  };
  units: number;
  unit: string;
  categories: AnyData;
}

export const ChainList: Record<string, Chain> = {
  Polkadot: {
    icon: PolkadotIcon,
    ledger: {
      icon: PolkadotAppIcon,
    },
    endpoints: {
      rpc: 'wss://apps-rpc.polkadot.io',
      lightClient: Sc.WellKnownChain.polkadot,
    },
    units: 10,
    unit: 'DOT',
    categories: {
      nominationPools: {
        name: 'Nomination Pools',
        icon: faUserGroup,
      },
    },
  },
};

export const chainIcon = (chain: ChainID) => ChainList[chain]?.icon;

export const chainCurrency = (chain: ChainID) => ChainList[chain]?.unit;

export const chainUnits = (chain: ChainID) => ChainList[chain]?.units;

export const chainCategory = (chain: ChainID, category: string) =>
  ChainList[chain]?.categories[category];
