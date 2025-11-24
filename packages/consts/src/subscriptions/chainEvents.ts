// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainEventSubscription, HelpItemKey } from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';

type PalletName = keyof typeof Pallets;
type EventName<P extends PalletName> = keyof (typeof Pallets)[P];

const prefix = 'help:chainEvents';

export const ChainPallets: Record<string, string[]> = {
  'Polkadot Asset Hub': [
    'Balances',
    'ConvictionVoting',
    'NominationPools',
    'Referenda',
    'Staking',
  ],
  'Kusama Asset Hub': [
    'Balances',
    'ConvictionVoting',
    'NominationPools',
    'Referenda',
    'Staking',
  ],
  'Paseo Asset Hub': [
    'Balances',
    'ConvictionVoting',
    'NominationPools',
    'Referenda',
    'Staking',
  ],
};

export const getReadablePallet = (pallet: string) => {
  switch (pallet) {
    case 'Balances':
      return 'Balances';
    case 'ConvictionVoting':
      return 'Conviction Voting';
    case 'NominationPools':
      return 'Nomination Pools';
    case 'Referenda':
      return 'Referenda';
    case 'Staking':
      return 'Staking';
    default:
      return 'Unknown Category';
  }
};

const Pallets: Record<
  string,
  Record<string, { helpKey: HelpItemKey; label: string }>
> = {
  /** Balances */
  Balances: {
    Transfer: {
      helpKey: `${prefix}:Balances:Transfer`,
      label: 'Transfer',
    },
    Reserved: {
      helpKey: `${prefix}:Balances:Reserved`,
      label: 'Reserved',
    },
    Unreserved: {
      helpKey: `${prefix}:Balances:Unreserved`,
      label: 'Unreserved',
    },
    Deposit: {
      helpKey: `${prefix}:Balances:Deposit`,
      label: 'Deposit',
    },
    Withdraw: {
      helpKey: `${prefix}:Balances:Withdraw`,
      label: 'Withdraw',
    },
    Slashed: {
      helpKey: `${prefix}:Balances:Slashed`,
      label: 'Slashed',
    },
    Suspended: {
      helpKey: `${prefix}:Balances:Suspended`,
      label: 'Suspended',
    },
    Restored: {
      helpKey: `${prefix}:Balances:Restored`,
      label: 'Restored',
    },
    Locked: {
      helpKey: `${prefix}:Balances:Locked`,
      label: 'Locked',
    },
    Unlocked: {
      helpKey: `${prefix}:Balances:Unlocked`,
      label: 'Unlocked',
    },
    Frozen: {
      helpKey: `${prefix}:Balances:Frozen`,
      label: 'Frozen',
    },
    Thawed: {
      helpKey: `${prefix}:Balances:Thawed`,
      label: 'Thawed',
    },
  },
  /** Conviction Voting */
  ConvictionVoting: {
    Delegated: {
      helpKey: `${prefix}:ConvictionVoting:Delegated`,
      label: 'Delegated',
    },
    Undelegated: {
      helpKey: `${prefix}:ConvictionVoting:Undelegated`,
      label: 'Undelegated',
    },
    Voted: {
      helpKey: `${prefix}:ConvictionVoting:Voted`,
      label: 'Voted',
    },
    VoteRemoved: {
      helpKey: `${prefix}:ConvictionVoting:VoteRemoved`,
      label: 'Vote Removed',
    },
    VoteUnlocked: {
      helpKey: `${prefix}:ConvictionVoting:VoteUnlocked`,
      label: 'Vote Unlocked',
    },
  },
  /** Nomination Pools */
  NominationPools: {
    Created: { helpKey: `${prefix}:NominationPools:Created`, label: 'Created' },
    Bonded: { helpKey: `${prefix}:NominationPools:Bonded`, label: 'Bonded' },
    PaidOut: {
      helpKey: `${prefix}:NominationPools:PaidOut`,
      label: 'Paid Out',
    },
    Unbonded: {
      helpKey: `${prefix}:NominationPools:Unbonded`,
      label: 'Unbonded',
    },
    Withdrawn: {
      helpKey: `${prefix}:NominationPools:Withdrawn`,
      label: 'Withdrawn',
    },
    Destroyed: {
      helpKey: `${prefix}:NominationPools:Destroyed`,
      label: 'Destroyed',
    },
    StateChanged: {
      helpKey: `${prefix}:NominationPools:StateChanged`,
      label: 'State Changed',
    },
    MemberRemoved: {
      helpKey: `${prefix}:NominationPools:MemberRemoved`,
      label: 'Member Removed',
    },
    PoolSlashed: {
      helpKey: `${prefix}:NominationPools:PoolSlashed`,
      label: 'Pool Slashed',
    },
    UnbondingPoolSlashed: {
      helpKey: `${prefix}:NominationPools:UnbondingPoolSlashed`,
      label: 'Unbonding Pool Slashed',
    },
    PoolCommissionUpdated: {
      helpKey: `${prefix}:NominationPools:PoolCommissionUpdated`,
      label: 'Pool Commission Updated',
    },
    PoolCommissionChangeRateUpdated: {
      helpKey: `${prefix}:NominationPools:PoolCommissionChangeRateUpdated`,
      label: 'Pool Commission Changed Rate Updated',
    },
    PoolCommissionClaimPermissionUpdated: {
      helpKey: `${prefix}:NominationPools:PoolCommissionClaimPermissionUpdated`,
      label: 'Pool Commission Claim Permission Updated',
    },
    PoolCommissionClaimed: {
      helpKey: `${prefix}:NominationPools:PoolCommissionClaimed`,
      label: 'Pool Commission Claimed',
    },
    MetadataUpdated: {
      helpKey: `${prefix}:NominationPools:MetadataUpdated`,
      label: 'Metadata Updated',
    },
  },
  /** Referenda */
  Referenda: {
    Approved: {
      helpKey: `${prefix}:Referenda:Approved`,
      label: 'Referendum Approved',
    },
    Canceled: {
      helpKey: `${prefix}:Referenda:Canceled`,
      label: 'Referendum Canceled',
    },
    ConfirmAborted: {
      helpKey: `${prefix}:Referenda:ConfirmAborted`,
      label: 'Referendum Confirmation Aborted',
    },
    ConfirmStarted: {
      helpKey: `${prefix}:Referenda:ConfirmStarted`,
      label: 'Referendum Confirmation Started',
    },
    Confirmed: {
      helpKey: `${prefix}:Referenda:Confirmed`,
      label: 'Referendum Confirmed',
    },
    DecisionDepositPlaced: {
      helpKey: `${prefix}:Referenda:DecisionDepositPlaced`,
      label: 'Decision Deposit Placed',
    },
    DecisionDepositRefunded: {
      helpKey: `${prefix}:Referenda:DecisionDepositRefunded`,
      label: 'Decision Deposit Refunded',
    },
    DecisionStarted: {
      helpKey: `${prefix}:Referenda:DecisionStarted`,
      label: 'Decision Phase Started',
    },
    DepositSlashed: {
      helpKey: `${prefix}:Referenda:DepositSlashed`,
      label: 'Deposit Slashed',
    },
    Killed: {
      helpKey: `${prefix}:Referenda:Killed`,
      label: 'Referendum Killed',
    },
    Rejected: {
      helpKey: `${prefix}:Referenda:Rejected`,
      label: 'Referendum Rejected',
    },
    SubmissionDepositRefunded: {
      helpKey: `${prefix}:Referenda:SubmissionDepositRefunded`,
      label: 'Submission Deposit Refunded',
    },
    Submitted: {
      helpKey: `${prefix}:Referenda:Submitted`,
      label: 'Referendum Submitted',
    },
    TimedOut: {
      helpKey: `${prefix}:Referenda:TimedOut`,
      label: 'Referendum Timed Out',
    },
  },
  /** Staking */
  Staking: {
    EraPaid: { helpKey: `${prefix}:Staking:EraPaid`, label: 'Era Paid' },
    Rewarded: {
      helpKey: `${prefix}:Staking:Rewarded`,
      label: 'Nominator Rewarded',
    },
    Slashed: { helpKey: `${prefix}:Staking:Slashed`, label: 'Staker Slashed' },
    Bonded: { helpKey: `${prefix}:Staking:Bonded`, label: 'Bonded' },
    Unbonded: { helpKey: `${prefix}:Staking:Unbonded`, label: 'Unbonded' },
    Kicked: { helpKey: `${prefix}:Staking:Kicked`, label: 'Nominator Kicked' },
    Chilled: { helpKey: `${prefix}:Staking:Chilled`, label: 'Account Chilled' },
    ValidatorPrefsSet: {
      helpKey: `${prefix}:Staking:ValidatorPrefsSet`,
      label: 'Validator Preferences Set',
    },
  },
};

export const getEventSubscriptions = <P extends PalletName>(
  chainId: ChainID,
  pallet: P
): ChainEventSubscription[] =>
  Object.entries(Pallets[pallet]).map(([eventName, { helpKey, label }]) => ({
    chainId,
    enabled: false,
    eventName: eventName as EventName<P>,
    helpKey,
    id: `${chainId}::${pallet}::${eventName}`,
    label,
    osNotify: false,
    pallet,
  }));
