// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export type HelpItems = HelpItem[];

export interface HelpItem {
  key: HelpItemKey;
  title: string;
  definition: string[];
}

export type HelpStatus = 'closed' | 'open' | 'closing';

export type HelpItemKey =
  | 'help:import:vault'
  | 'help:import:ledger'
  | 'help:import:readOnly'
  | 'help:subscription:balances:transfers'
  | 'help:subscription:balances:frozen'
  | 'help:subscription:balances:reserved'
  | 'help:subscription:balances:spendable'
  | 'help:subscription:nominationPools:commission'
  | 'help:subscription:nominationPools:name'
  | 'help:subscription:nominationPools:state'
  | 'help:subscription:nominationPools:roles'
  | 'help:subscription:nominationPools:rewards'
  | 'help:subscription:nominating:commission'
  | 'help:subscription:nominating:exposure'
  | 'help:subscription:nominating:payouts'
  | 'help:subscription:nominating:nominations'
  | 'help:subscription:chain:timestamp'
  | 'help:subscription:chain:currentSlot'
  | 'help:settings:dockedWindow'
  | 'help:settings:showOnAllWorkspaces'
  | 'help:settings:silenceOsNotifications'
  | 'help:settings:importData'
  | 'help:settings:exportData'
  | 'help:settings:showDebuggingSubscriptions'
  | 'help:settings:enableAutomaticSubscriptions'
  | 'help:settings:enablePolkassembly'
  | 'help:settings:hideDockIcon'
  | 'help:settings:keepOutdatedEvents'
  | 'help:openGov:track'
  | 'help:openGov:origin'
  | 'help:openGov:maxDeciding'
  | 'help:openGov:preparePeriod'
  | 'help:openGov:decisionPeriod'
  | 'help:openGov:confirmPeriod'
  | 'help:openGov:enactmentPeriod'
  | 'help:openGov:origin:root'
  | 'help:openGov:origin:whitelistedCaller'
  | 'help:openGov:origin:wishForChange'
  | 'help:openGov:origin:stakingAdmin'
  | 'help:openGov:origin:treasurer'
  | 'help:openGov:origin:leaseAdmin'
  | 'help:openGov:origin:fellowshipAdmin'
  | 'help:openGov:origin:generalAdmin'
  | 'help:openGov:origin:auctionAdmin'
  | 'help:openGov:origin:referendumCanceller'
  | 'help:openGov:origin:referendumKiller'
  | 'help:openGov:origin:smallTipper'
  | 'help:openGov:origin:bigTipper'
  | 'help:openGov:origin:smallSpender'
  | 'help:openGov:origin:mediumSpender'
  | 'help:openGov:origin:bigSpender'
  | 'help:openGov:treasuryBalance'
  | 'help:openGov:nextBurn'
  | 'help:openGov:toBeAwarded'
  | 'help:openGov:spendPeriod'
  | 'help:interval:openGov:referendumVotes'
  | 'help:interval:openGov:decisionPeriod'
  | 'help:interval:openGov:referendumThresholds'
  | 'help:docs:disclaimer'
  | 'help:docs:privacy'
  | 'help:summary:activeAccounts'
  | 'help:summary:events'
  | 'help:summary:subscriptions';
