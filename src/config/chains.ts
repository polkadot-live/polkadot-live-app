// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import * as Sc from '@substrate/connect';
import { AnyData } from '@polkadot-live/types';
import { ReactComponent as PolkadotIcon } from './svg/polkadotIcon.svg';
import { ReactComponent as PolkadotAppIcon } from './svg/ledger/polkadot.svg';
import { ChainID } from '@polkadot-live/types/chains';
import { FunctionComponent, SVGProps } from 'react';

interface Chain {
  icon: FunctionComponent<
    SVGProps<SVGSVGElement> & { title?: string | undefined }
  >;
  ledger: {
    icon: FunctionComponent<
      SVGProps<SVGSVGElement> & { title?: string | undefined }
    >;
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
