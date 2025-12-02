// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  ChainEventSubscription,
  FlattenedAccountData,
  HelpItemKey,
} from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';

type PalletName = keyof typeof Pallets;
type EventName<P extends PalletName> = keyof (typeof Pallets)[P];
type SubscriptionScope = 'global' | 'account';

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
  'Westend Asset Hub': [
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
  Record<
    string,
    { helpKey: HelpItemKey; label: string; scope: SubscriptionScope[] }
  >
> = {
  /** Balances */
  Balances: {
    Transfer: {
      helpKey: `${prefix}:Balances:Transfer`,
      label: 'Transfer',
      scope: ['global', 'account'],
    },
    Reserved: {
      helpKey: `${prefix}:Balances:Reserved`,
      label: 'Reserved',
      scope: ['global', 'account'],
    },
    Unreserved: {
      helpKey: `${prefix}:Balances:Unreserved`,
      label: 'Unreserved',
      scope: ['global', 'account'],
    },
    Deposit: {
      helpKey: `${prefix}:Balances:Deposit`,
      label: 'Deposit',
      scope: ['global', 'account'],
    },
    Withdraw: {
      helpKey: `${prefix}:Balances:Withdraw`,
      label: 'Withdraw',
      scope: ['global', 'account'],
    },
    Slashed: {
      helpKey: `${prefix}:Balances:Slashed`,
      label: 'Slashed',
      scope: ['global', 'account'],
    },
    Suspended: {
      helpKey: `${prefix}:Balances:Suspended`,
      label: 'Suspended',
      scope: ['global', 'account'],
    },
    Restored: {
      helpKey: `${prefix}:Balances:Restored`,
      label: 'Restored',
      scope: ['global', 'account'],
    },
    Locked: {
      helpKey: `${prefix}:Balances:Locked`,
      label: 'Locked',
      scope: ['global', 'account'],
    },
    Unlocked: {
      helpKey: `${prefix}:Balances:Unlocked`,
      label: 'Unlocked',
      scope: ['global', 'account'],
    },
    Frozen: {
      helpKey: `${prefix}:Balances:Frozen`,
      label: 'Frozen',
      scope: ['global', 'account'],
    },
    Thawed: {
      helpKey: `${prefix}:Balances:Thawed`,
      label: 'Thawed',
      scope: ['global', 'account'],
    },
  },
  /** Conviction Voting */
  ConvictionVoting: {
    Delegated: {
      helpKey: `${prefix}:ConvictionVoting:Delegated`,
      label: 'Delegated',
      scope: ['global', 'account'],
    },
    Undelegated: {
      helpKey: `${prefix}:ConvictionVoting:Undelegated`,
      label: 'Undelegated',
      scope: ['global', 'account'],
    },
    Voted: {
      helpKey: `${prefix}:ConvictionVoting:Voted`,
      label: 'Voted',
      scope: ['global', 'account'],
    },
    VoteRemoved: {
      helpKey: `${prefix}:ConvictionVoting:VoteRemoved`,
      label: 'Vote Removed',
      scope: ['global', 'account'],
    },
    VoteUnlocked: {
      helpKey: `${prefix}:ConvictionVoting:VoteUnlocked`,
      label: 'Vote Unlocked',
      scope: ['global', 'account'],
    },
  },
  /** Nomination Pools */
  NominationPools: {
    Created: {
      helpKey: `${prefix}:NominationPools:Created`,
      label: 'Created',
      scope: ['global'],
    },
    Bonded: {
      helpKey: `${prefix}:NominationPools:Bonded`,
      label: 'Bonded',
      scope: ['global', 'account'],
    },
    PaidOut: {
      helpKey: `${prefix}:NominationPools:PaidOut`,
      label: 'Paid Out',
      scope: ['global', 'account'],
    },
    Unbonded: {
      helpKey: `${prefix}:NominationPools:Unbonded`,
      label: 'Unbonded',
      scope: ['global', 'account'],
    },
    Withdrawn: {
      helpKey: `${prefix}:NominationPools:Withdrawn`,
      label: 'Withdrawn',
      scope: ['global', 'account'],
    },
    Destroyed: {
      helpKey: `${prefix}:NominationPools:Destroyed`,
      label: 'Destroyed',
      scope: ['global'],
    },
    StateChanged: {
      helpKey: `${prefix}:NominationPools:StateChanged`,
      label: 'State Changed',
      scope: ['global'],
    },
    MemberRemoved: {
      helpKey: `${prefix}:NominationPools:MemberRemoved`,
      label: 'Member Removed',
      scope: ['global', 'account'],
    },
    PoolSlashed: {
      helpKey: `${prefix}:NominationPools:PoolSlashed`,
      label: 'Pool Slashed',
      scope: ['global'],
    },
    UnbondingPoolSlashed: {
      helpKey: `${prefix}:NominationPools:UnbondingPoolSlashed`,
      label: 'Unbonding Pool Slashed',
      scope: ['global'],
    },
    PoolCommissionUpdated: {
      helpKey: `${prefix}:NominationPools:PoolCommissionUpdated`,
      label: 'Pool Commission Updated',
      scope: ['global'],
    },
    PoolCommissionChangeRateUpdated: {
      helpKey: `${prefix}:NominationPools:PoolCommissionChangeRateUpdated`,
      label: 'Pool Commission Changed Rate Updated',
      scope: ['global'],
    },
    PoolCommissionClaimPermissionUpdated: {
      helpKey: `${prefix}:NominationPools:PoolCommissionClaimPermissionUpdated`,
      label: 'Pool Commission Claim Permission Updated',
      scope: ['global'],
    },
    PoolCommissionClaimed: {
      helpKey: `${prefix}:NominationPools:PoolCommissionClaimed`,
      label: 'Pool Commission Claimed',
      scope: ['global'],
    },
    MetadataUpdated: {
      helpKey: `${prefix}:NominationPools:MetadataUpdated`,
      label: 'Metadata Updated',
      scope: ['global'],
    },
  },
  /** Referenda */
  Referenda: {
    Approved: {
      helpKey: `${prefix}:Referenda:Approved`,
      label: 'Referendum Approved',
      scope: ['global'],
    },
    Canceled: {
      helpKey: `${prefix}:Referenda:Canceled`,
      label: 'Referendum Canceled',
      scope: ['global'],
    },
    ConfirmAborted: {
      helpKey: `${prefix}:Referenda:ConfirmAborted`,
      label: 'Referendum Confirmation Aborted',
      scope: ['global'],
    },
    ConfirmStarted: {
      helpKey: `${prefix}:Referenda:ConfirmStarted`,
      label: 'Referendum Confirmation Started',
      scope: ['global'],
    },
    Confirmed: {
      helpKey: `${prefix}:Referenda:Confirmed`,
      label: 'Referendum Confirmed',
      scope: ['global'],
    },
    DecisionDepositPlaced: {
      helpKey: `${prefix}:Referenda:DecisionDepositPlaced`,
      label: 'Decision Deposit Placed',
      scope: ['global'],
    },
    DecisionDepositRefunded: {
      helpKey: `${prefix}:Referenda:DecisionDepositRefunded`,
      label: 'Decision Deposit Refunded',
      scope: ['global'],
    },
    DecisionStarted: {
      helpKey: `${prefix}:Referenda:DecisionStarted`,
      label: 'Decision Phase Started',
      scope: ['global'],
    },
    DepositSlashed: {
      helpKey: `${prefix}:Referenda:DepositSlashed`,
      label: 'Deposit Slashed',
      scope: ['global'],
    },
    Killed: {
      helpKey: `${prefix}:Referenda:Killed`,
      label: 'Referendum Killed',
      scope: ['global'],
    },
    Rejected: {
      helpKey: `${prefix}:Referenda:Rejected`,
      label: 'Referendum Rejected',
      scope: ['global'],
    },
    SubmissionDepositRefunded: {
      helpKey: `${prefix}:Referenda:SubmissionDepositRefunded`,
      label: 'Submission Deposit Refunded',
      scope: ['global'],
    },
    Submitted: {
      helpKey: `${prefix}:Referenda:Submitted`,
      label: 'Referendum Submitted',
      scope: ['global'],
    },
    TimedOut: {
      helpKey: `${prefix}:Referenda:TimedOut`,
      label: 'Referendum Timed Out',
      scope: ['global'],
    },
  },
  /** Staking */
  Staking: {
    EraPaid: {
      helpKey: `${prefix}:Staking:EraPaid`,
      label: 'Era Paid',
      scope: ['global'],
    },
    Rewarded: {
      helpKey: `${prefix}:Staking:Rewarded`,
      label: 'Nominator Rewarded',
      scope: ['global', 'account'],
    },
    Slashed: {
      helpKey: `${prefix}:Staking:Slashed`,
      label: 'Staker Slashed',
      scope: ['global', 'account'],
    },
    Bonded: {
      helpKey: `${prefix}:Staking:Bonded`,
      label: 'Bonded',
      scope: ['global', 'account'],
    },
    Unbonded: {
      helpKey: `${prefix}:Staking:Unbonded`,
      label: 'Unbonded',
      scope: ['global', 'account'],
    },
    Kicked: {
      helpKey: `${prefix}:Staking:Kicked`,
      label: 'Nominator Kicked',
      scope: ['global', 'account'],
    },
    Chilled: {
      helpKey: `${prefix}:Staking:Chilled`,
      label: 'Account Chilled',
      scope: ['global', 'account'],
    },
    ValidatorPrefsSet: {
      helpKey: `${prefix}:Staking:ValidatorPrefsSet`,
      label: 'Validator Preferences Set',
      scope: ['global'],
    },
  },
};

export const getEventSubscriptions = <P extends PalletName>(
  chainId: ChainID,
  pallet: P
): ChainEventSubscription[] =>
  Object.entries(Pallets[pallet]).map(([eventName, { helpKey, label }]) => ({
    id: `${chainId}::${pallet}::${eventName}`,
    kind: 'chain',
    chainId,
    enabled: false,
    eventName: eventName as EventName<P>,
    helpKey,
    label,
    osNotify: false,
    pallet,
  }));

export const getEventSubscriptionsForAccount = <P extends PalletName>(
  chainId: ChainID,
  flattened: FlattenedAccountData
): ChainEventSubscription[] => {
  // Determine pallets.
  const { nominationPoolData, nominatingData } = flattened;
  const pallets = ['Balances', 'ConvictionVoting'];
  nominationPoolData && pallets.push('NominationPools');
  nominatingData && pallets.push('Staking');

  // Return array of subscriptions for account.
  return pallets
    .map((pallet) =>
      Object.entries(Pallets[pallet])
        .filter(([, { scope }]) => scope.includes('account'))
        .map(([eventName, { helpKey, label }]) => ({
          id: `${chainId}::${flattened.address}::${pallet}::${eventName}`,
          kind: 'account' as 'chain' | 'account',
          chainId,
          enabled: false,
          eventName: eventName as EventName<P>,
          helpKey,
          label,
          osNotify: false,
          pallet,
        }))
    )
    .flat();
};
