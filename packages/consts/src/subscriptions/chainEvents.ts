// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainEventSubscription } from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';

type PalletName = keyof typeof Pallets;
type EventName<P extends PalletName> = keyof (typeof Pallets)[P];

const Pallets: Record<string, Record<string, { label: string }>> = {
  Referenda: {
    Approved: { label: 'Referendum Approved' },
    Canceled: { label: 'Referendum Canceled' },
    ConfirmAborted: { label: 'Referendum Confirmation Aborted' },
    ConfirmStarted: { label: 'Referendum Confirmation Started' },
    Confirmed: { label: 'Referendum Confirmed' },
    DecisionDepositPlaced: { label: 'Decision Deposit Placed' },
    DecisionDepositRefunded: { label: 'Decision Deposit Refunded' },
    DecisionStarted: { label: 'Decision Phase Started' },
    DepositSlashed: { label: 'Deposit Slashed' },
    Killed: { label: 'Referendum Killed' },
    Rejected: { label: 'Referendum Rejected' },
    SubmissionDepositRefunded: { label: 'Submission Deposit Refunded' },
    Submitted: { label: 'Referendum Submitted' },
    TimedOut: { label: 'Referendum Timed Out' },
  },
};

export const getEventSubscriptions = <P extends PalletName>(
  chainId: ChainID,
  pallet: P
): ChainEventSubscription[] =>
  Object.entries(Pallets[pallet]).map(([eventName, { label }]) => ({
    chainId,
    enabled: false,
    eventName: eventName as EventName<P>,
    id: `${chainId}::${pallet}::${eventName}`,
    label,
    osNotify: false,
    pallet,
  }));
