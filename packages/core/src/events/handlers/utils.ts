// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getUnixTime } from 'date-fns';
import {
  getPolkassemblySubdomain,
  getSubsquareSubdomain,
} from '@polkadot-live/consts/chains';
import type {
  AnyData,
  EventCallback,
  EventChainData,
  TxAction,
  UriAction,
} from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';

interface EventMeta {
  category: string;
  chainId: ChainID;
  subtitle?: string;
  title?: string;
  txActions?: TxAction[];
  uriActions?: UriAction[];
  data?: AnyData;
}

export const getRefUriActions = (
  chainId: ChainID,
  refId: number
): UriAction[] => [
  {
    label: 'Subsquare',
    uri: `https://${getSubsquareSubdomain(chainId)}.subsquare.io/referenda/${refId}`,
  },
  {
    label: 'Polkassembly',
    uri: `https://${getPolkassemblySubdomain(chainId)}.polkassembly.io/referenda/${refId}`,
  },
];

export const makeChainEvent = (meta: EventMeta): EventCallback => {
  const { category, chainId, subtitle, title, txActions, uriActions, data } =
    meta;
  return {
    uid: '',
    category,
    who: {
      origin: 'chainEvent',
      data: { chainId } as EventChainData,
    },
    title: title ?? '',
    subtitle: subtitle ?? '',
    data: data ?? null,
    timestamp: getUnixTime(new Date()),
    stale: false,
    taskAction: '',
    txActions: txActions ?? [],
    uriActions: uriActions ?? [],
  };
};
