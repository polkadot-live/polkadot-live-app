// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import * as Sc from '@substrate/connect';
import PolkadotIcon from './svg/polkadotIcon.svg?react';
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
        timestamp: {
          name: 'Timestamps',
          icon: faUserGroup,
        },
        currentSlot: {
          name: 'Current Slots',
          icon: faUserGroup,
        },
        account: {
          name: 'Transfers',
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
