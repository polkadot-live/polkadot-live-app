// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import PolkadotIcon from '@polkadot-live/consts/svg/polkadotIcon.svg?react';
import KusamaIcon from '@polkadot-live/consts/svg/kusamaIcon.svg?react';
import WestendIcon from '@polkadot-live/consts/svg/westendIcon.svg?react';
import PolkadotAppIcon from '@polkadot-live/consts/svg/ledger/polkadot.svg?react';
import { polkadot, ksmcc3, westend2 } from '@substrate/connect-known-chains';
import type { ChainID, SelectNetworkData } from '@polkadot-live/types/chains';
import type { FunctionComponent, SVGProps } from 'react';
import type { NodeEndpoint } from '@polkadot-live/types/apis';

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
    rpcs: NodeEndpoint[];
    lightClient: string;
  };
  units: number;
  unit: string;
  prefix: number;
}

const CategoryList = new Map([
  ['balances', { name: 'Balances', icon: faUserGroup }],
  ['debugging', { name: 'Debugging', icon: faUserGroup }],
  ['nominationPools', { name: 'Nomination Pools', icon: faUserGroup }],
  ['nominating', { name: 'Nominating', icon: faUserGroup }],
  ['openGov', { name: 'OpenGov', icon: faUserGroup }],
]);

export const ChainList = new Map<ChainID, Chain>([
  [
    'Polkadot',
    {
      icon: PolkadotIcon,
      ledger: {
        icon: PolkadotAppIcon,
      },
      endpoints: {
        rpcs: [
          'wss://rpc.polkadot.io',
          'wss://apps-rpc.polkadot.io',
          'wss://polkadot-rpc.dwellir.com',
          'wss://polkadot-rpc-tn.dwellir.com',
          'wss://rpc.ibp.network/polkadot',
          'wss://rpc.dotters.network/polkadot',
          'wss://1rpc.io/dot',
          'wss://polkadot-public-rpc.blockops.network/ws',
          'wss://rpc-polkadot.luckyfriday.io',
          'wss://polkadot.public.curie.radiumblock.co/ws',
          'wss://rockx-dot.w3node.com/polka-public-dot/ws',
          'wss://dot-rpc.stakeworld.io',
        ],
        lightClient: polkadot,
      },
      units: 10,
      unit: 'DOT',
      prefix: 0,
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
        rpcs: [
          'wss://kusama-rpc.polkadot.io',
          'wss://kusama-rpc.dwellir.com',
          'wss://kusama-rpc-tn.dwellir.com',
          'wss://rpc.ibp.network/kusama',
          'wss://rpc.dotters.network/kusama',
          'wss://1rpc.io/ksm',
          'wss://kusama-public-rpc.blockops.network/ws',
          'wss://rpc-kusama.luckyfriday.io',
          'wss://kusama.public.curie.radiumblock.co/ws',
          'wss://rockx-ksm.w3node.com/polka-public-ksm/ws',
          'wss://ksm-rpc.stakeworld.io',
        ],
        lightClient: ksmcc3,
      },
      units: 12,
      unit: 'KSM',
      prefix: 2,
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
        rpcs: [
          'wss://rpc.ibp.network/westend',
          'wss://westend-rpc.polkadot.io',
          'wss://westend-rpc.dwellir.com',
          'wss://westend-rpc-tn.dwellir.com',
          'wss://rpc.dotters.network/westend',
          'wss://westend-rpc.blockops.network/ws',
          'wss://westend.public.curie.radiumblock.co/ws',
          'wss://rpc-westend.luckyfriday.io',
        ],
        lightClient: westend2,
      },
      units: 12,
      unit: 'WND',
      prefix: 42,
    },
  ],
]);

export const chainIcon = (chain: ChainID) =>
  (ChainList.get(chain) as Chain).icon;

export const chainCurrency = (chain: ChainID) =>
  (ChainList.get(chain) as Chain).unit;

export const chainUnits = (chain: ChainID) =>
  (ChainList.get(chain) as Chain).units;

export const getCategory = (category: string) => CategoryList.get(category);

export const getSelectNetworkData = (
  darkMode: boolean
): SelectNetworkData[] => [
  {
    network: 'Polkadot',
    ledgerId: 'dot',
    ChainIcon: chainIcon('Polkadot'),
    iconWidth: 18,
    iconFill: '#ac2461',
  },
  {
    network: 'Kusama',
    ledgerId: 'kusama',
    ChainIcon: chainIcon('Kusama'),
    iconWidth: 24,
    iconFill: darkMode ? '#e7e7e7' : '#2f2f2f',
  },
  {
    network: 'Westend',
    ledgerId: '',
    ChainIcon: chainIcon('Westend'),
    iconWidth: 24,
    iconFill: darkMode ? '#e7e7e7' : '#2f2f2f',
  },
];
