// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import * as Sc from '@substrate/connect';
import PolkadotIcon from './svg/polkadotIcon.svg?react';
import WestendIcon from './svg/westendIcon.svg?react';
import KusamaIcon from './svg/kusamaIcon.svg?react';
import PolkadotAppIcon from './svg/ledger/polkadot.svg?react';
import type { ChainID } from '@/types/chains';
import type { FunctionComponent, SVGProps } from 'react';
import type { AnyData } from '@/types/misc';

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
  prefix: number;
  categories: AnyData;
}

export const ChainList = new Map<ChainID, Chain>([
  [
    'Polkadot',
    {
      icon: PolkadotIcon,
      ledger: {
        icon: PolkadotAppIcon,
      },
      endpoints: {
        rpc: 'wss://rpc.polkadot.io',
        lightClient: Sc.WellKnownChain.polkadot,
      },
      units: 10,
      unit: 'DOT',
      prefix: 0,
      categories: {
        balances: {
          name: 'Balances',
          icon: faUserGroup,
        },
        debugging: {
          name: 'Debugging',
          icon: faUserGroup,
        },
        nominationPools: {
          name: 'Nomination Pools',
          icon: faUserGroup,
        },
      },
    },
  ],
  [
    'Westend',
    {
      icon: WestendIcon,
      ledger: {
        icon: WestendIcon,
      },
      endpoints: {
        rpc: 'wss://westend-rpc.polkadot.io',
        lightClient: Sc.WellKnownChain.westend2,
      },
      units: 12,
      unit: 'WND',
      prefix: 42,
      categories: {
        balances: {
          name: 'Balances',
          icon: faUserGroup,
        },
        debugging: {
          name: 'Debugging',
          icon: faUserGroup,
        },
        nominationPools: {
          name: 'Nomination Pools',
          icon: faUserGroup,
        },
      },
    },
  ],
  [
    'Kusama',
    {
      icon: KusamaIcon,
      ledger: {
        icon: KusamaIcon,
      },
      endpoints: {
        rpc: 'wss://kusama-rpc.polkadot.io',
        lightClient: Sc.WellKnownChain.ksmcc3,
      },
      units: 12,
      unit: 'KSM',
      prefix: 2,
      categories: {
        balances: {
          name: 'Balances',
          icon: faUserGroup,
        },
        debugging: {
          name: 'Debugging',
          icon: faUserGroup,
        },
        nominationPools: {
          name: 'Nomination Pools',
          icon: faUserGroup,
        },
      },
    },
  ],
]);

export const chainIcon = (chain: ChainID) =>
  (ChainList.get(chain) as Chain).icon;

export const chainCurrency = (chain: ChainID) =>
  (ChainList.get(chain) as Chain).unit;

export const chainUnits = (chain: ChainID) =>
  (ChainList.get(chain) as Chain).units;

export const chainCategory = (chain: ChainID, category: string) =>
  (ChainList.get(chain) as Chain).categories[category];
