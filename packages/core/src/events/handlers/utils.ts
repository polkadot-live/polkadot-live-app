// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  getPolkassemblySubdomain,
  getSubsquareSubdomain,
} from '@polkadot-live/consts/chains';
import { getUnixTime } from 'date-fns';
import type {
  EventAccountData,
  EventCallback,
  EventChainData,
  UriAction,
} from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';
import type { EventMeta, WhoMeta } from '../types';

export const getRefUriActions = (
  chainId: ChainID,
  refId: number,
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

export const makeChainEvent = (
  meta: EventMeta,
  whoMeta?: WhoMeta,
): EventCallback => {
  const { category, chainId, subtitle, title, txActions, uriActions, data } =
    meta;
  const whoData: EventAccountData | EventChainData = whoMeta
    ? ({ ...whoMeta } as EventAccountData)
    : ({ chainId } as EventChainData);

  return {
    uid: '',
    category,
    who: {
      origin: whoMeta ? 'account' : 'chainEvent',
      data: { ...whoData },
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

export const notifyTitle = (base: string, whoMeta?: WhoMeta) =>
  whoMeta ? `${whoMeta.accountName} (${base})` : base;
