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
    key: 'help:openGov:track',
    title: 'Track',
    definition: [
      'Each track has its own dispatch origin and a preset configuration that governs the voting process and parameters.',
    ],
  },
  {
    key: 'help:openGov:origin',
    title: 'Origin',
    definition: [
      'Each origin has a fixed set of privileges. When making a proposal, it is important to choose the origin that has the privilege to execute the referenda.',
    ],
  },
  {
    key: 'help:openGov:maxDeciding',
    title: 'Max Deciding',
    definition: [
      'The maximum number of referenda that can be in the decision period of a track all at once.',
    ],
  },
  {
    key: 'help:openGov:preparePeriod',
    title: 'Prepare Period',
    definition: [
      'The minimum time the referendum needs to wait before it can progress to the next phase after submission.',
      'Voting is enabled, but the votes do not count toward the outcome of the referendum yet.',
    ],
  },
  {
    key: 'help:openGov:decisionPeriod',
    title: 'Decision Period',
    definition: [
      'Amount of time a decision may take to be approved to move to the confirming period.',
      'If the proposal is not approved by the end of the decision period, it gets rejected.',
    ],
  },
  {
    key: 'help:openGov:confirmPeriod',
    title: 'Confirmation Period',
    definition: [
      'The total time the referenda must meet both the min approval and support criteria during the decision period in order to pass and enter the enactment period.',
    ],
  },
  {
    key: 'help:openGov:enactmentPeriod',
    title: 'Enactment Period',
    definition: [
      'Minimum time that an approved proposal must be in the dispatch queue after approval.',
      'The proposer has the option to set the enactment period to be of any value greater than the min enactment period.',
    ],
  },
  {
    key: 'help:openGov:origin:root',
    title: 'Root Origin',
    definition: [
      'The origin with the highest level of privileges. This track requires extremely high levels of approval and support for early passing. The prepare and enactment periods are also large.',
      'For instance, a referendum proposed in this track needs to amass 48.2% support (total network issuance) by the end of the first day with over 93.5% approval to be considered to be part of the confirm period.',
      'The support curve drops linearly to 25% by the end of day 14 and almost to 0% by the end of day 28. This ensures that the token holders receive ample time to vote on the proposal during the decision period.',
    ],
  },
  {
    key: 'help:openGov:origin:whitelistedCaller',
    title: 'Whitelisted Caller Origin',
    definition: [
      'Origin commanded by the Fellowship whitelist some hash of a call and allow the call to be dispatched with the root origin (after the referendum passes). This track allows for a shorter voting turnaround, safe in the knowledge through an open and transparent process for time-critical proposals.',
      'For instance, a referendum proposed in this track needs to amass 20% support (much less than the root) by the end of the first day with over 93.5% approval to be considered to be part of the confirm period.',
      'Note how no referendum on the Whitelisted track can ever pass with less than 5% support.',
    ],
  },
  {
    key: 'help:openGov:origin:wishForChange',
    title: 'Wish For Change Origin',
    definition: [
      'The Wish For Change track serves as a medium for gathering consensus through OpenGov on a proposed change to the network through an on-chain remark.',
      'This track was added to ensure the Root track, which is typically utilized for handling one referendum at a time due to the sensitive nature of Root calls, is not employed to convey network desires to various bodies within the network.',
      'These remark statements could be voted on simultaneously because they lack stateful logic impacting the network. They should not delay voting on proposals requiring Root or be obligated to its queue.',
      'The approval/support criteria resemble Root, and passing items on this track serves as a signal for a change without conferring privileges.',
    ],
  },
  {
    key: 'help:openGov:origin:stakingAdmin',
    title: 'Staking Admin Origin',
    definition: [
      'The origin for canceling slashes. This origin has the privilege to execute calls from the staking pallet and the Election Provider Multiphase Pallet.',
    ],
  },
  {
    key: 'help:openGov:origin:treasurer',
    title: 'Treasurer Origin',
    definition: [
      'The origin for spending funds from the treasury (up to 10M DOT). This origin has the privilege to execute calls from the Treasury pallet.',
    ],
  },
  {
    key: 'help:openGov:origin:leaseAdmin',
    title: 'Lease Admin Origin',
    definition: [
      'Origin can force slot leases. This origin has the privilege to execute calls from the Slots pallet.',
    ],
  },
  {
    key: 'help:openGov:origin:fellowshipAdmin',
    title: 'Fellowship Admin Origin',
    definition: ['The origin for managing the composition of the fellowship.'],
  },
  {
    key: 'help:openGov:origin:generalAdmin',
    title: 'General Admin Origin',
    definition: [
      'The origin managing the registrar and permissioned HRMP channel operations.',
    ],
  },
  {
    key: 'help:openGov:origin:auctionAdmin',
    title: 'Auction Admin Origin',
    definition: [
      'The origin for starting auctions. This origin can execute calls from the Auctions pallet and the Scheduler Pallet.',
    ],
  },
  {
    key: 'help:openGov:origin:referendumCanceller',
    title: 'Referendum Canceller Origin',
    definition: [
      'The origin can cancel referenda.',
      'This track has a low lead time and approval/support curves with slightly sharper reductions in their thresholds for passing.',
    ],
  },
  {
    key: 'help:openGov:origin:referendumKiller',
    title: 'Referendum Killer Origin',
    definition: [
      'The origin can cancel an ongoing referendum and slash the deposits.',
      'This track also has a low lead-time and approval/support curves with slightly sharper reductions in their thresholds for passing.',
    ],
  },
  {
    key: 'help:openGov:origin:smallTipper',
    title: 'Small Tipper Origin',
    definition: [
      'Origin able to spend up to 250 DOT from the treasury at once.',
    ],
  },
  {
    key: 'help:openGov:origin:bigTipper',
    title: 'Big Tipper Origin',
    definition: [
      'Origin able to spend up to 1,000 DOT from the treasury at once.',
    ],
  },
  {
    key: 'help:openGov:origin:smallSpender',
    title: 'Small Spender Origin',
    definition: [
      'Origin able to spend up to 10,000 DOT from the treasury at once.',
    ],
  },
  {
    key: 'help:openGov:origin:mediumSpender',
    title: 'Medium Spender Origin',
    definition: [
      'Origin able to spend up to 100,000 DOT from the treasury at once.',
    ],
  },
  {
    key: 'help:openGov:origin:bigSpender',
    title: 'Big Spender Origin',
    definition: [
      'Origin able to spend up to 1,000,000 DOT from the treasury at once.',
    ],
  },
  {
    key: 'help:openGov:treasuryBalance',
    title: 'Treasury Balance',
    definition: [
      'Funds collected through a portion of block production rewards, transaction fees, slashing, staking inefficiencies, etc.',
    ],
  },
  {
    key: 'help:openGov:nextBurn',
    title: 'Next Burn',
    definition: [
      'If the Treasury ends a spend period without spending all of its funds, it suffers a burn of a percentage of its funds.',
    ],
  },
  {
    key: 'help:openGov:toBeAwarded',
    title: 'To Be Awarded',
    definition: [
      'The amount of funds in the treasury to be spent on proposals at the end of the current spend period.',
    ],
  },
  {
    key: 'help:openGov:spendPeriod',
    title: 'Spend Period',
    definition: [
      'Funds requested from the treasury are periodically distributed at the end of the spend period.',
    ],
  },
  {
    key: 'help:interval:openGov:referendumVotes',
    title: 'Referendum Votes Subscription',
    definition: ['TODO: Description of referendum votes subscription.'],
  },
  {
    key: 'help:interval:openGov:decisionPeriod',
    title: 'Decision Period Subscription',
    definition: [
      'TODO: Description of referendum decision period subscription.',
    ],
  },
  {
    key: 'help:interval:openGov:referendumThresholds',
    title: 'Thresholds Subscription',
    definition: ['TODO: Description of referendum thresholds subscription.'],
  },
];
