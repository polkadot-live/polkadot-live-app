// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  polkadot,
  polkadot_asset_hub,
  polkadot_people,
  ksmcc3,
  ksmcc3_asset_hub,
  ksmcc3_people,
  westend2,
  westend2_asset_hub,
  westend2_people,
  paseo,
} from '@dedot/chain-specs';
import type { AccountSource } from '@polkadot-live/types/accounts';
import type {
  ChainID,
  EcosystemID,
  LedgerAppName,
  LedgerSelectNetworkData,
  RpcSystemChain,
} from '@polkadot-live/types/chains';

type PreReleaseStage = 'alpha' | 'beta' | 'rc' | null;

export const PreRelease: PreReleaseStage = 'beta';

interface Chain {
  endpoints: {
    rpcs: `wss://${string}`[];
    lightClient: string | undefined;
  };
  units: number;
  unit: string;
  prefix: number;
}

const CategoryList = new Map([
  ['balances', { label: 'Balances' }],
  ['debugging', { label: 'Debugging' }],
  ['nominationPools', { label: 'Nomination Pools' }],
  ['nominating', { label: 'Nominating' }],
  ['openGov', { label: 'OpenGov' }],
  ['staking', { label: 'Staking' }],
  ['voting', { label: 'Voting' }],
]);

export const ChainList = new Map<ChainID, Chain>([
  [
    'Polkadot Relay',
    {
      endpoints: {
        rpcs: [
          'wss://dot-rpc.stakeworld.io',
          'wss://polkadot-public-rpc.blockops.network/ws',
          'wss://polkadot-rpc.publicnode.com',
          'wss://polkadot.api.onfinality.io/public-ws',
          'wss://polkadot.dotters.network',
          'wss://polkadot.public.curie.radiumblock.co/ws',
          'wss://rpc-polkadot.luckyfriday.io',
          'wss://rpc.ibp.network/polkadot',
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
          'wss://asset-hub-polkadot.dotters.network',
          'wss://dot-rpc.stakeworld.io/assethub',
          'wss://polkadot-asset-hub-rpc.polkadot.io',
          'wss://rpc-asset-hub-polkadot.luckyfriday.io',
          'wss://statemint-rpc-tn.dwellir.com',
          'wss://statemint.api.onfinality.io/public-ws',
          'wss://statemint.public.curie.radiumblock.co/ws',
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
          'wss://people-polkadot.dotters.network',
          'wss://people-polkadot.public.curie.radiumblock.co/ws',
          'wss://polkadot-people-rpc.polkadot.io',
          'wss://rpc-people-polkadot.luckyfriday.io',
          'wss://sys.ibp.network/people-polkadot',
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
          'wss://ksm-rpc.stakeworld.io',
          'wss://kusama-rpc-tn.dwellir.com',
          'wss://kusama-rpc.publicnode.com',
          'wss://kusama.api.onfinality.io/public-ws',
          'wss://kusama.dotters.network',
          'wss://rpc-kusama.luckyfriday.io',
          'wss://rpc.ibp.network/kusama',
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
          'wss://asset-hub-kusama.dotters.network',
          'wss://ksm-rpc.stakeworld.io/assethub',
          'wss://kusama-asset-hub-rpc.polkadot.io',
          'wss://rpc-asset-hub-kusama.luckyfriday.io',
          'wss://statemine-rpc-tn.dwellir.com',
          'wss://statemine.public.curie.radiumblock.co/ws',
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
          'wss://ksm-rpc.stakeworld.io/people',
          'wss://kusama-people-rpc.polkadot.io',
          'wss://people-kusama.dotters.network',
          'wss://rpc-people-kusama.luckyfriday.io',
          'wss://sys.ibp.network/people-kusama',
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
          'wss://pas-rpc.stakeworld.io',
          'wss://paseo-rpc.dwellir.com',
          'wss://paseo.dotters.network',
          'wss://paseo.rpc.amforc.com',
          'wss://rpc.ibp.network/paseo',
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
          'wss://asset-hub-paseo.dotters.network',
          'wss://pas-rpc.stakeworld.io/assethub',
          'wss://sys.ibp.network/asset-hub-paseo',
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
          'wss://people-paseo.dotters.network',
          'wss://people-paseo.rpc.amforc.com',
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
          'wss://westend-rpc-tn.dwellir.com',
          'wss://westend-rpc.polkadot.io',
          'wss://westend.public.curie.radiumblock.co/ws',
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
          'wss://westend-asset-hub-rpc.polkadot.io',
          'wss://westmint-rpc-tn.dwellir.com',
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
          'wss://people-westend-rpc.dwellir.com',
          'wss://westend-people-rpc.polkadot.io',
        ],
        lightClient: westend2_people,
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
  ['Polkadot Asset Hub', 'polkadot'],
  ['Kusama Asset Hub', 'kusama'],
]);

const PolkassemblySubdomainMap = new Map<ChainID, string>([
  ['Polkadot Asset Hub', 'polkadot'],
  ['Kusama Asset Hub', 'kusama'],
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
    network: 'Polkadot Asset Hub',
    ledgerId: 'dot',
    iconWidth: 18,
  },
  {
    network: 'Kusama Asset Hub',
    ledgerId: 'kusama',
    iconWidth: 18,
  },
];

/**
 * Get an array of supported chains for imported accounts.
 */
export const getSupportedChains = (): Record<ChainID, Chain> => {
  const unsupported: ChainID[] = [
    'Polkadot Relay',
    'Kusama Relay',
    'Paseo Relay',
    'Westend Relay',
  ];
  const record = {} as Record<ChainID, Chain>;
  for (const [cid, chain] of Array.from(ChainList.entries())) {
    if (!unsupported.includes(cid)) {
      record[cid] = chain;
    }
  }
  return record;
};

export const getSs58Prefix = (chainId: ChainID) =>
  ChainList.get(chainId)?.prefix ?? 42;

/**
 * Get account sources capable of signing extrinsics.
 */
export const getSignSources = (): AccountSource[] => [
  'ledger',
  'vault',
  'wallet-connect',
];

/**
 * Get chain IDs that support send screen transfers.
 */
export const getSendChains = (): ChainID[] => [
  'Polkadot Asset Hub',
  'Kusama Asset Hub',
  'Paseo Asset Hub',
  'Westend Asset Hub',
];

/**
 * Get chain IDs that support staking APIs.
 */
export const getStakingChains = (): ChainID[] => [
  'Polkadot Asset Hub',
  'Kusama Asset Hub',
  'Paseo Asset Hub',
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
  'Polkadot Asset Hub',
  'Kusama Asset Hub',
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
