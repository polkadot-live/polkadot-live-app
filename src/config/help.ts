// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { HelpItems } from '@/renderer/contexts/common/Help/types';

export const HelpConfig: HelpItems = [
  {
    key: 'help:import:vault',
    title: 'Polkadot Vault',
    definition: [
      'Polkadot Vault (formerly Parity Signer) is a cold storage solution that allows you to use a phone in airplane mode as an air-gapped wallet.',
      'The Vault app is not technically a wallet, as it does not allow the transfer of funds.',
      'It is more of a key-chain tool that will enable you the create, manage, and restore accounts.',
    ],
  },
  {
    key: 'help:import:ledger',
    title: 'Ledger Hardware Wallets',
    definition: [
      'Compatible Ledger devices are partially supported on Polkadot Live. Import your Ledger account to manage your activity on Polkadot.',
      'Using a hardware wallet ensures a secure experience, whereby your keys stay on the hardware device at all times. This is also known as cold storage, as there is no active internet connection to your wallet.',
      "In order to import and sign transactions with your Ledger device, your device must have the Polkadot Ledger app installed. The Polkadot app can be installed via Ledger's very own Ledger Live application.",
    ],
  },
  {
    key: 'help:import:readOnly',
    title: 'Read Only Accounts',
    definition: [
      'Read Only accounts are accounts that can be imported, but are not able to sign transactions.',
      'This means that you can turn on any subscription task in Polkadot Live for a read-only account, but you cannot perform any actions.',
    ],
  },
  {
    key: 'help:subscription:balances:transfers',
    title: 'Balances: Transfers Subscription',
    definition: [
      'Get notified when any part of your balance changes.',
      'A Polkadot balance is comprised of a free, reserved, and frozen balance. Regular transfers to and from other addresses will change your free balance, whilst staking and voting activities may change your reserved and frozen balances, respectively.',
    ],
  },
  {
    key: 'help:subscription:nominationPools:commission',
    title: 'Nomination Pools: Commission Subscription',
    definition: [
      "Get notified when your nomination pool's commission setting has changed.",
      'A larger commission percentage may indicate that you will receive less rewards, as the nomination pool will take a bigger cut of rewards at the end of each era.',
    ],
  },
  {
    key: 'help:subscription:nominationPools:name',
    title: 'Nomination Pools: Name Subscription',
    definition: [
      "Get notified when your nomination pool's name has changed when a new era starts.",
    ],
  },
  {
    key: 'help:subscription:nominationPools:state',
    title: 'Nomination Pools: State Subscription',
    definition: [
      'Get notified when your nomination pool has changed its state setting when a new era starts.',
      'The "Open" state means anyone can join the pool and no members can be permissionlessly removed.',
      'The "Blocked" state means that no members can join the pool, and some admin roles can permissionlessly kick (unbond) members.',
      'The "Destroying" state means that no members can join the pool, and all members can be permissionlessly removed',
    ],
  },
  {
    key: 'help:subscription:nominationPools:roles',
    title: 'Nomination Pools: Roles Subscription',
    definition: [
      'Get notified when your nomination pool has changed its roles setting when a new era starts.',
    ],
  },
  {
    key: 'help:subscription:nominationPools:rewards',
    title: 'Nomination Pools: Unclaimed Rewards Subscription',
    definition: [
      'Get notified when you have unclaimed nomination pool rewards, when a new era starts.',
    ],
  },
  {
    key: 'help:subscription:nominating:commission',
    title: 'Nominating: Commission Subscription',
    definition: [
      'Get notified when any of your nominated validators have changed their commission setting, when a new era starts.',
      'You will be notified when you are nominating new validators in the new era, and when any validators that you nominated in the previous era have changed their commision setting.',
    ],
  },
  {
    key: 'help:subscription:nominating:exposure',
    title: 'Nominating: Exposure Subscription',
    definition: [
      'Get notified when your nominating exposure changes when a new era starts.',
      'Your address is "exposed" in the current era when at least one of your nominated validators are selected to actively participate in consensus, and have a chance of receiving rewards.',
    ],
  },
  {
    key: 'help:subscription:nominating:payouts',
    title: 'Nominating: Pending Payouts Subscription',
    definition: [
      'Get notified when you have pending payouts from your nomiated validators.',
      'Polkadot Live will process the last 7 eras in order to calculate any pending payouts. This calculation may take a minute, depending on your network connection speed.',
    ],
  },
  {
    key: 'help:subscription:chain:timestamp',
    title: 'Timestamp Subscription',
    definition: [
      "Get notified when the chain's current timestamp changes.",
      'Use this subscription as a debugging tool or to observe live data being received from the respective blockchain network.',
    ],
  },
  {
    key: 'help:subscription:chain:currentSlot',
    title: 'Current Slot Subscription',
    definition: [
      "Get notified when the chain's current slot changes.",
      'Use this subscription as a debugging tool or to observe live data being received from the respective blockchain network.',
    ],
  },
  {
    key: 'help:settings:dockedWindow',
    title: 'Docked Window',
    definition: [
      "Enabling this setting will display the main window below the app's tray icon with a fixed size and position.",
      'Turn off this setting to position and size the main window freely.',
    ],
  },
  {
    key: 'help:settings:showOnAllWorkspaces',
    title: 'Show on All Workspaces',
    definition: [
      'Displays Polkadot Live windows on all workspaces. Switching to a different workspace will still show your Polkadot Live windows.',
      'Turn off this setting to display Polkadot Live on a single workspace.',
    ],
  },
  {
    key: 'help:settings:silenceOsNotifications',
    title: 'Silence OS Notifications',
    definition: [
      'Enable to silence (not display) native OS notifications application wide.',
      'This setting is global and will override OS notification settings for individual subscriptions.',
    ],
  },
  {
    key: 'help:settings:importData',
    title: 'Import Data',
    definition: [
      'Import a data file that was exported from another Polkadot Live installation to restore your accounts.',
      'Accounts in the data file that do not currently exist in Polkadot Live will be added to the import window. From there, you can import the account and turn on subscriptions in the normal manner.',
      'This feature currently supports Vault and Read-Only accounts.',
    ],
  },
  {
    key: 'help:settings:exportData',
    title: 'Export Data',
    definition: [
      'Export account data to a text file, allowing you to backup your accounts managed by Polkadot Live.',
      'Use the corresponding "Import" button in the settings window to read the exported data file and restore your accounts in Polkadot Live.',
      'This feature currently supports Vault and Read-Only accounts.',
    ],
  },
  {
    key: 'help:openGov:trackId',
    title: 'Track ID',
    definition: ['TODO: Track ID.'],
  },
  {
    key: 'help:openGov:origin',
    title: 'Origin',
    definition: ['TODO: Origin.'],
  },
  {
    key: 'help:openGov:maxDeciding',
    title: 'Max Deciding',
    definition: ['TODO: Max Deciding.'],
  },
  {
    key: 'help:openGov:preparePeriod',
    title: 'Prepare Period',
    definition: ['TODO: Prepare Period.'],
  },
  {
    key: 'help:openGov:decisionPeriod',
    title: 'Decision Period',
    definition: ['TODO: Decision Period.'],
  },
  {
    key: 'help:openGov:confirmPeriod',
    title: 'Confirm Period',
    definition: ['TODO: Confirm Period.'],
  },
  {
    key: 'help:openGov:enactmentPeriod',
    title: 'Enactment Period',
    definition: ['TODO: Enactment Period.'],
  },
  {
    key: 'help:openGov:origin:root',
    title: 'Root Origin',
    definition: ['TODO: Root origin.'],
  },
  {
    key: 'help:openGov:origin:whitelistedCaller',
    title: 'Whitelisted Caller Origin',
    definition: ['TODO: Whitelisted Caller Origin.'],
  },
  {
    key: 'help:openGov:origin:wishForChange',
    title: 'Wish For Change Origin',
    definition: ['TODO: Wish For Change Origin.'],
  },
  {
    key: 'help:openGov:origin:stakingAdmin',
    title: 'Staking Admin Origin',
    definition: ['TODO: Staking Admin Origin.'],
  },
  {
    key: 'help:openGov:origin:treasurer',
    title: 'Treasurer Origin',
    definition: ['TODO: Treasurer Origin.'],
  },
  {
    key: 'help:openGov:origin:leaseAdmin',
    title: 'Lease Admin Origin',
    definition: ['TODO: Lease Admin Origin.'],
  },
  {
    key: 'help:openGov:origin:fellowshipAdmin',
    title: 'Fellowship Admin Origin',
    definition: ['TODO: Fellowship Admin Origin.'],
  },
  {
    key: 'help:openGov:origin:generalAdmin',
    title: 'General Admin Origin',
    definition: ['TODO: General Admin Origin.'],
  },
  {
    key: 'help:openGov:origin:auctionAdmin',
    title: 'Auction Admin Origin',
    definition: ['TODO: Auction Admin Origin.'],
  },
  {
    key: 'help:openGov:origin:referendumCanceller',
    title: 'Referendum Canceller Origin',
    definition: ['TODO: Referendum Canceller Origin.'],
  },
  {
    key: 'help:openGov:origin:referendumKiller',
    title: 'Referendum Killer Origin',
    definition: ['TODO: Referendum Killer Origin.'],
  },
  {
    key: 'help:openGov:origin:smallTipper',
    title: 'Small Tipper Origin',
    definition: ['TODO: Small Tipper Origin.'],
  },
  {
    key: 'help:openGov:origin:bigTipper',
    title: 'Big Tipper Origin',
    definition: ['TODO: Big Tipper Origin.'],
  },
  {
    key: 'help:openGov:origin:smallSpender',
    title: 'Small Spender Origin',
    definition: ['TODO: Small Spender Origin.'],
  },
  {
    key: 'help:openGov:origin:mediumSpender',
    title: 'Medium Spender Origin',
    definition: ['TODO: Medium Spender Origin.'],
  },
  {
    key: 'help:openGov:origin:bigSpender',
    title: 'Big Spender Origin',
    definition: ['TODO: Big Spender Origin.'],
  },
];
