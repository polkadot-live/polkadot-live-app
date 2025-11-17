// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { PalletReferendaEvent as PolkadotAssetHubReferendaEvent } from '@dedot/chaintypes/polkadot-asset-hub';
import type { PalletReferendaEvent as KusamaAssetHubReferendaEvent } from '@dedot/chaintypes/kusama-asset-hub';
import type { AnyFunction } from '@polkadot-live/types';

/**
 * Types.
 */
type PalletReferendaEvent =
  | PolkadotAssetHubReferendaEvent
  | KusamaAssetHubReferendaEvent;

type EventName = PalletReferendaEvent['name'];

type EventMap = {
  [K in EventName]: Extract<PalletReferendaEvent, { name: K }>;
};

/**
 * Handler.
 */
export const handleReferendaEvent = (palletEvent: PalletReferendaEvent) => {
  const handler = HandlerRegistry[palletEvent.name];
  if (handler) {
    handler(palletEvent as AnyFunction);
  }
};

/**
 * Registry.
 */
const HandlerRegistry: {
  [K in keyof EventMap]?: (event: EventMap[K]) => void;
} = {
  Approved: () => {
    /* empty */
  },
  Cancelled: () => {
    /* empty */
  },
  ConfirmAborted: () => {
    /* empty */
  },
  ConfirmStarted: () => {
    /* empty */
  },
  Confirmed: () => {
    /* empty */
  },
  DecisionDepositPlaced: () => {
    /* empty */
  },
  DecisionDepositRefunded: () => {
    /* empty */
  },
  DecisionStarted: () => {
    /* empty */
  },
  DepositSlashed: () => {
    /* empty */
  },
  Killed: () => {
    /* empty */
  },
  Rejected: () => {
    /* empty */
  },
  SubmissionDepositRefunded: () => {
    /* empty */
  },
  Submitted: () => {
    /* empty */
  },
  TimedOut: () => {
    /* empty */
  },
};
