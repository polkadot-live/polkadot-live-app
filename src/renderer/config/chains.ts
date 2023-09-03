// Copyright 2023 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import * as Sc from '@substrate/connect';
import { ChainID } from 'types';
import { AnyData } from 'types/notifications';
import { ReactComponent as PolkadotIcon } from  '../svg/polkadotIcon.svg';
import { ReactComponent as PolkadotAppIcon } from '../svg/ledger/polkadot.svg';

export const ChainList: Record<ChainID, AnyData> = {
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

export const chainIcon = (chain: ChainID) => {
  return ChainList[chain]?.icon;
};

export const chainCurrency = (chain: ChainID) => {
  return ChainList[chain]?.unit;
};

export const chainUnits = (chain: ChainID) => {
  return ChainList[chain]?.units;
};

export const chainCategory = (chain: ChainID, category: string) => {
  return ChainList[chain]?.categories[category];
};
