// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import {
  polkadot,
  polkadot_asset_hub,
  polkadot_people,
  ksmcc3,
  ksmcc3_asset_hub,
  ksmcc3_people,
  westend2,
  westend2_asset_hub,
  westend_people,
  paseo,
} from '@substrate/connect-known-chains';
import type { AccountSource } from '@polkadot-live/types/accounts';
import type {
  ChainID,
  EcosystemID,
  LedgerAppName,
  LedgerSelectNetworkData,
  RpcSystemChain,
} from '@polkadot-live/types/chains';
import type { NodeEndpoint } from '@polkadot-live/types/apis';

interface Chain {
  endpoints: {
    rpcs: NodeEndpoint[];
    lightClient: string | undefined;
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
    'Polkadot Relay',
    {
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
    'Polkadot Asset Hub',
    {
      endpoints: {
        rpcs: [
          'wss://sys.ibp.network/statemint',
          'wss://sys.dotters.network/statemint',
          'wss://sys.ibp.network/asset-hub-polkadot',
          'wss://asset-hub-polkadot-rpc.dwellir.com',
          'wss://statemint-rpc-tn.dwellir.com',
          'wss://polkadot-assethub-rpc.blockops.network/ws',
          'wss://asset-hub-polkadot.dotters.network',
          'wss://rpc-asset-hub-polkadot.luckyfriday.io',
          'wss://polkadot-asset-hub-rpc.polkadot.io',
          'wss://dot-rpc.stakeworld.io/assethub',
        ],
        lightClient: polkadot_asset_hub,
      },
      units: 10,
      unit: 'DOT',
      prefix: 0,
    },
  ],
  [
    'Polkadot People',
    {
      endpoints: {
        rpcs: [
          'wss://sys.ibp.network/people-polkadot',
          'wss://people-polkadot.dotters.network',
          'wss://rpc-people-polkadot.luckyfriday.io',
          'wss://polkadot-people-rpc.polkadot.io',
        ],
        lightClient: polkadot_people,
      },
      units: 10,
      unit: 'DOT',
      prefix: 0,
    },
  ],
  [
    'Kusama Relay',
    {
      endpoints: {
        rpcs: [
          'wss://kusama-rpc.polkadot.io',
          'wss://kusama-rpc.dwellir.com',
          'wss://kusama-rpc-tn.dwellir.com',
          'wss://rpc.ibp.network/kusama',
          'wss://rpc.dotters.network/kusama',
          'wss://1rpc.io/ksm',
          'wss://rpc-kusama.luckyfriday.io',
          'wss://kusama.public.curie.radiumblock.co/ws',
        ],
        lightClient: ksmcc3,
      },
      units: 12,
      unit: 'KSM',
      prefix: 2,
    },
  ],
  [
    'Kusama Asset Hub',
    {
      endpoints: {
        rpcs: [
          'wss://sys.ibp.network/asset-hub-kusama',
          'wss://asset-hub-kusama-rpc.dwellir.com',
          'wss://statemine-rpc-tn.dwellir.com',
          'wss://asset-hub-kusama.dotters.network',
          'wss://rpc-asset-hub-kusama.luckyfriday.io',
          'wss://kusama-asset-hub-rpc.polkadot.io',
          'wss://statemine.public.curie.radiumblock.co/ws',
          'wss://ksm-rpc.stakeworld.io/assethub',
        ],
        lightClient: ksmcc3_asset_hub,
      },
      units: 12,
      unit: 'KSM',
      prefix: 2,
    },
  ],
  [
    'Kusama People',
    {
      endpoints: {
        rpcs: [
          'wss://sys.ibp.network/people-kusama',
          'wss://people-kusama-rpc.dwellir.com',
          'wss://people-kusama.dotters.network',
          'wss://rpc-people-kusama.luckyfriday.io',
          'wss://kusama-people-rpc.polkadot.io',
          'wss://ksm-rpc.stakeworld.io/people',
        ],
        lightClient: ksmcc3_people,
      },
      units: 12,
      unit: 'KSM',
      prefix: 2,
    },
  ],
  [
    'Paseo Relay',
    {
      endpoints: {
        rpcs: [
          'wss://paseo-rpc.dwellir.com',
          'wss://paseo.rpc.amforc.com',
          'wss://rpc.ibp.network/paseo',
          'wss://paseo.dotters.network',
          'wss://pas-rpc.stakeworld.io',
        ],
        lightClient: paseo,
      },
      units: 10,
      unit: 'PAS',
      prefix: 0,
    },
  ],
  [
    'Paseo Asset Hub',
    {
      endpoints: {
        rpcs: [
          'wss://asset-hub-paseo-rpc.dwellir.com',
          'wss://sys.ibp.network/asset-hub-paseo',
          'wss://asset-hub-paseo.dotters.network',
          'wss://pas-rpc.stakeworld.io/assethub',
          'wss://sys.turboflakes.io/asset-hub-paseo',
        ],
        lightClient: undefined,
      },
      units: 10,
      unit: 'PAS',
      prefix: 0,
    },
  ],
  [
    'Paseo People',
    {
      endpoints: {
        rpcs: [
          'wss://sys.ibp.network/people-paseo',
          'wss://people-paseo.dotters.network',
        ],
        lightClient: undefined,
      },
      units: 10,
      unit: 'PAS',
      prefix: 0,
    },
  ],
  [
    'Westend Relay',
    {
      endpoints: {
        rpcs: [
          'wss://rpc.ibp.network/westend',
          'wss://westend-rpc.polkadot.io',
          'wss://westend-rpc.dwellir.com',
          'wss://westend-rpc-tn.dwellir.com',
          'wss://rpc.dotters.network/westend',
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
  [
    'Westend Asset Hub',
    {
      endpoints: {
        rpcs: [
          'wss://westmint-rpc-tn.dwellir.com',
          'wss://sys.ibp.network/asset-hub-westend',
          'wss://asset-hub-westend-rpc.dwellir.com',
          'wss://asset-hub-westend.dotters.network',
          'wss://westend-asset-hub-rpc.polkadot.io',
          'wss://asset-hub-westend.rpc.permanence.io',
        ],
        lightClient: westend2_asset_hub,
      },
      units: 12,
      unit: 'WND',
      prefix: 42,
    },
  ],
  [
    'Westend People',
    {
      endpoints: {
        rpcs: [
          'wss://sys.ibp.network/people-westend',
          'wss://people-westend-rpc.dwellir.com',
          'wss://people-westend.dotters.network',
          'wss://westend-people-rpc.polkadot.io',
        ],
        lightClient: westend_people,
      },
      units: 12,
      unit: 'WND',
      prefix: 42,
    },
  ],
]);

const RpcChainToChainID: Record<RpcSystemChain, ChainID> = {
  Polkadot: 'Polkadot Relay',
  'Polkadot Asset Hub': 'Polkadot Asset Hub',
  'Polkadot People': 'Polkadot People',
  Kusama: 'Kusama Relay',
  'Kusama Asset Hub': 'Kusama Asset Hub',
  'Kusama People': 'Kusama People',
  'Paseo Testnet': 'Paseo Relay',
  'Paseo Asset Hub': 'Paseo Asset Hub',
  'Paseo People': 'Paseo People',
  Westend: 'Westend Relay',
  'Westend Asset Hub': 'Westend Asset Hub',
  'Westend People': 'Westend People',
};

const ChainIDToLedgerAppName = new Map<ChainID, LedgerAppName>([
  ['Polkadot Relay', 'Polkadot'],
  ['Polkadot Asset Hub', 'Statemint'],
  ['Kusama Relay', 'Kusama'],
  ['Kusama Asset Hub', 'Statemine'],
]);

export const getLedgerAppName = (chainId: ChainID): LedgerAppName =>
  ChainIDToLedgerAppName.get(chainId)!;

const SubscanSubdomainMap = new Map<ChainID, string>([
  ['Polkadot Relay', 'polkadot'],
  ['Polkadot Asset Hub', 'assethub-polkadot'],
  ['Polkadot People', 'people-polkadot'],
  ['Kusama Relay', 'kusama'],
  ['Kusama Asset Hub', 'assethub-kusama'],
  ['Kusama People', 'people-kusama'],
  ['Paseo Relay', 'paseo'],
  ['Paseo Asset Hub', 'assethub-paseo'],
  ['Paseo People', 'people-paseo'],
  ['Westend Relay', 'westend'],
  ['Westend Asset Hub', 'assethub-westend'],
  ['Westend People', 'people-westend'],
]);

const SubsquareSubdomainMap = new Map<ChainID, string>([
  ['Polkadot Relay', 'polkadot'],
  ['Kusama Relay', 'kusama'],
]);

const PolkassemblySubdomainMap = new Map<ChainID, string>([
  ['Polkadot Relay', 'polkadot'],
  ['Kusama Relay', 'kusama'],
]);

export const getPolkassemblySubdomain = (chainId: ChainID): string =>
  PolkassemblySubdomainMap.get(chainId)!;

export const getSubscanSubdomain = (chainId: ChainID): string =>
  SubscanSubdomainMap.get(chainId)!;

export const getSubsquareSubdomain = (chainId: ChainID): string =>
  SubsquareSubdomainMap.get(chainId)!;

export const getChainIdFromRpcChain = (rpcChain: RpcSystemChain): ChainID =>
  RpcChainToChainID[rpcChain];

export const chainCurrency = (chain: ChainID) =>
  (ChainList.get(chain) as Chain).unit;

export const chainUnits = (chain: ChainID) =>
  (ChainList.get(chain) as Chain).units;

export const getCategory = (category: string) => CategoryList.get(category);

export const getSelectLedgerNetworkData = (): LedgerSelectNetworkData[] => [
  {
    network: 'Polkadot Relay',
    ledgerId: 'dot',
    iconWidth: 18,
  },
  {
    network: 'Kusama Relay',
    ledgerId: 'kusama',
    iconWidth: 18,
  },
];

/**
 * Get an array of supported chains.
 */
export const getSupportedChains = (): Record<ChainID, Chain> => {
  const unsupported: ChainID[] = ['Westend Relay'];
  const record = {} as Record<ChainID, Chain>;

  for (const [cid, chain] of Array.from(ChainList.entries())) {
    if (!unsupported.includes(cid)) {
      record[cid] = chain;
    }
  }

  return record;
};

/**
 * Get chain IDs that support send screen transfers.
 */
export const getSendChains = (): ChainID[] => [
  'Kusama Relay',
  'Westend Asset Hub',
];

/**
 * Get chain IDs that support staking APIs.
 */
export const getStakingChains = (): ChainID[] => [
  'Polkadot Relay',
  'Kusama Relay',
  'Paseo Relay',
  'Westend Asset Hub',
];

/**
 * Get an array of supported import methods.
 */
export const getSupportedSources = (): AccountSource[] => [
  'ledger',
  'read-only',
  'vault',
  'wallet-connect',
];

/**
 * Get chain IDs that support importing Ledger accounts.
 */
export const getSupportedLedgerChains = (): ChainID[] => [
  'Polkadot Relay',
  'Kusama Relay',
];

/**
 * Returns a mapping of ecosystem IDs to their corresponding chain IDs.
 */
export const getEcosystemChainMap = (): Map<EcosystemID, ChainID[]> =>
  new Map([
    ['Polkadot', ['Polkadot Relay', 'Polkadot Asset Hub', 'Polkadot People']],
    ['Kusama', ['Kusama Relay', 'Kusama Asset Hub', 'Kusama People']],
    ['Paseo', ['Paseo Relay', 'Paseo Asset Hub', 'Paseo People']],
    ['Westend', ['Westend Relay', 'Westend Asset Hub', 'Westend People']],
  ]);

/**
 * Determine if light client available for chain.
 */
export const hasLightClientSupport = (chainId: ChainID): boolean =>
  ChainList.get(chainId)?.endpoints.lightClient !== undefined;
