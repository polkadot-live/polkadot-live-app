// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
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
    title: 'Subscription: Free Balance',
    definition: [
      "Get notified when an account's free balance changes.",
      "An account's free balance can be used for on-chain activity like staking, participating in governance etc. but is not necessarily spendable (or transferrable).",
    ],
  },
  {
    key: 'help:subscription:balances:frozen',
    title: 'Subscription: Frozen Balance',
    definition: [
      "Get notified when an account's frozen balance changes.",
      "An account's frozen balance is the free balance locked for staking, governance, and vesting (also called locked balance).",
    ],
  },
  {
    key: 'help:subscription:balances:reserved',
    title: 'Subscription: Reserved Balance',
    definition: [
      "Get notified when an account's reserved balance changes.",
      'An account\'s reserved balance (also known as "on hold") is used for identities, proxies, OpenGov preimages and deposits, and it is no longer free.',
    ],
  },
  {
    key: 'help:subscription:balances:spendable',
    title: 'Subscription: Spendable Balance',
    definition: [
      "Get notified when an account's spendable balance changes.",
      "An account's spendable balance is the free balance that can be spent.",
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
      'Get notified when a commission change is detected among your nominated validators, when a new era starts.',
      'You will be notified when your cached commissions do not match the commissions fetched in the latest era.',
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
    title: 'Nominating: Era Rewards Subscription',
    definition: [
      'Get notified of your nominating rewards from the previous era.',
      'Polkadot Live will calculate your rewards in a decentralized way, fetching required state from the network.',
    ],
  },
  {
    key: 'help:subscription:nominating:nominations',
    title: 'Nominating: Nominations Subscription',
    definition: [
      'Get notified when any of your nominated validators have changed.',
      'You will be notified when your cached nominations do not match the nominations fetched in the latest era.',
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
    title: 'Show On All Workspaces',
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
    key: 'help:settings:showDebuggingSubscriptions',
    title: 'Show Debugging Subscriptions',
    definition: [
      'Show debugging subscriptions under the Subsciptions tab in the main window.',
      'Allows subscribing to the most recent slot and timestamp of the respective network.',
    ],
  },
  {
    key: 'help:settings:enableAutomaticSubscriptions',
    title: 'Enable Automatic Subscriptions',
    definition: [
      'Automatically subscribe to all possible subscriptions for an account when importing it.',
      'Turn this setting off if you prefer to have no subscriptions turned on for an account after importing it, and wish to turn on individual subscriptions manually.',
    ],
  },
  {
    key: 'help:settings:enablePolkassembly',
    title: 'Enable Polkassembly Data',
    definition: [
      'Use the Polkassembly API to fetch OpenGov metadata including proposal titles and descriptions.',
      'It is recommended to have this setting on if you wish to browse and subscribe to OpenGov referenda.',
    ],
  },
  {
    key: 'help:settings:hideDockIcon',
    title: 'Hide Dock Icon',
    definition: [
      'Turn this setting on to hide the Polkadot Live application icon in the Dock (macOS) or Taskbar (Windows).',
    ],
  },
  {
    key: 'help:settings:keepOutdatedEvents',
    title: 'Keep Outdated Events',
    definition: [
      'Turn this setting on if you wish to keep old event items upon receiving a new event item for subscriptions.',
      'When disabled, outdated event items will be removed when a new event item of the same subscription is received.',
      'Keep this setting enabled to track past event items for enabled subscriptions. Turning this setting off may be useful for users who have enabled many subscriptions, and only wish to see the most up-to-date notification data.',
    ],
  },
  {
    key: 'help:settings:importData',
    title: 'Import Data',
    definition: [
      'Import a data file that was exported from another Polkadot Live installation to restore your accounts.',
      'Accounts in the data file that do not currently exist in Polkadot Live will be added to the Accounts window. From there, you can import the account and turn on subscriptions in the normal manner.',
    ],
  },
  {
    key: 'help:settings:exportData',
    title: 'Export Data',
    definition: [
      'Export account data to a text file, allowing you to backup your accounts managed by Polkadot Live.',
      'Use the corresponding "Import" button in the settings window to read the exported data file and restore your accounts in Polkadot Live.',
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
    title: 'Votes Tally Subscription',
    definition: [
      'Receive the latest votes tally for an ongoing referendum.',
      'The proportion of total aye and nay votes are displayed as percentages for easily distingushing current voter sentiment.',
    ],
  },
  {
    key: 'help:interval:openGov:decisionPeriod',
    title: 'Decision Period Subscription',
    definition: [
      "Receive the remaining time of an ongoing referendum's decision period.",
      'Remaining time is formatted in a readable Days, Hours and Minutes format.',
    ],
  },
  {
    key: 'help:interval:openGov:referendumThresholds',
    title: 'Thresholds Subscription',
    definition: [
      "Receive the latest 'Minimum Approval Threshold' and 'Minimum Support Threshold' for an ongoing referendum.",
      "The referendum's approval and support thresholds must be over the minimum values for it to pass.",
    ],
  },
  {
    key: 'help:docs:disclaimer',
    title: 'Disclaimer',
    definition: [
      'These Terms of Use apply to the Polkadot Live application as well as any other affiliated sites, digital services, or applications on which a link to these Terms of Use appears (collectively, the “Application“) and apply to all visitors.',
      'These Terms of Use and any other terms that appear on the page from which you were directed to these Terms of Use govern your use of the Application. By accessing the Application, you agree to be legally bound by the Terms of Use then in effect. Please also refer to the relevant additional legal information applicable to your country.',
      'These Terms of Use as well as the information and materials contained in the Application are subject to change at any time and from time to time, without notice. If you do not agree to be bound by these Terms of Use, do not use the Application.',
      'The Application and all information and functionalities contained within them are not directed at or intended for use by any person resident or located in any jurisdiction where (1) the distribution of such information or functionality is contrary to the laws of such jurisdiction; or (2) such distribution is prohibited without obtaining the necessary licenses or authorizations by the relevant branch, subsidiary or affiliate office of Polkadot Live and such licenses or authorizations have not been obtained.',
      'Unless specifically stated otherwise, all price information is indicative only. No representation or warranty, either express or implied, is provided in relation to the accuracy, completeness or reliability of the materials, nor are they a complete statement of the securities, markets or developments referred to herein. The materials should not be regarded by recipients as a substitute for the exercise of their own judgment.',
      'All information and materials published, distributed or otherwise made available on the Application are provided for informational purposes, for your non-commercial, personal use only. No information or materials published on the Application constitutes a solicitation, an offer, or a recommendation to buy or sell any investment instruments, to effect any transactions, or to conclude any legal act of any kind whatsoever.',
      'Polkadot Live does not provide investment, legal or tax advice through the Application and nothing herein should be construed as being financial, legal, tax or other advice.',
      'Your use of the Application is at your own risk. The Application, together with all content, information and materials contained therein, is provided “as is“ and “as available“, without any representations or warranties of any kind. Any materials, information or content accessed, downloaded or otherwise obtained through the use of the Application is done at your own risk and Polkadot Live is not responsible for any damage to your computer systems or loss of data that results from the download of such material.',
      'To the fullest extent permitted by law, in no event shall Polkadot Live or our affiliates, or any of our directors, employees, contractors, service providers or agents have any liability whatsoever to any person for any direct or indirect loss, liability, cost, claim, expense or damage of any kind, whether in contract or in tort, including negligence, or otherwise, arising out of or related to the use of all or part of the Application, or any links to third party websites.',
      'Polkadot Live shall not be liable to you or anybody else for any damages incurred in connection with any messages sent to Polkadot Live using ordinary E-mail or any other electronic messaging system.',
    ],
  },
  {
    key: 'help:docs:privacy',
    title: 'Privacy Policy',
    definition: [
      '#Introduction',
      'Polkadot Live does not collect, use, or share any personal information from its users.',
      '#Data Collection',
      'Polkadot Live does not collect any personal data or information from users of the app.',
      '#Data Usage',
      'As no data is collected, no data is used, shared, or processed in any way.',
      '#Third-party Services',
      'Polkadot Live does not use any third-party services that collect user data.',
      '#Changes to This Policy',
      'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.',
      '#Contact Us',
      'If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us.',
      'Last updated: 16th June 2024',
    ],
  },
];
