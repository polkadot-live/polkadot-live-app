// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { HelpItems } from '@polkadot-live/types';

export const HelpConfig: HelpItems = [
  {
    key: 'help:import:vault',
    title: 'Polkadot Vault',
    definition: [
      'Polkadot Vault (formerly Parity Signer) is a cold storage solution that allows you to use a phone in airplane mode as an air-gapped wallet.',
      'The Vault app is not technically a wallet, as it does not allow the transfer of funds. It is more of a key-chain tool that will enable you the create, manage, and restore accounts.',
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
    key: 'help:import:walletConnect',
    title: 'WalletConnect Accounts',
    definition: [
      "WalletConnect is a protocol that securely connects users' cryptocurrency wallets with decentralized applications (dApps), enabling convenient and secure interaction between the two. It eliminates the need for manual entry of wallet information and enhances security in transactions and account access.",
    ],
  },
  {
    key: 'help:subscription:balances:transfers',
    title: 'Free Balance',
    definition: [
      "Get notified when an account's free balance changes.",
      "An account's free balance does not include the reserved balance. It can be used for on-chain activity like staking, participating in governance etc. but is not necessarily spendable (or transferrable).",
    ],
  },
  {
    key: 'help:subscription:balances:frozen',
    title: 'Frozen Balance',
    definition: [
      "Get notified when an account's frozen balance changes.",
      "An account's frozen balance is the free balance locked for staking, governance, and vesting (also called locked balance).",
    ],
  },
  {
    key: 'help:subscription:balances:reserved',
    title: 'Reserved Balance',
    definition: [
      "Get notified when an account's reserved balance changes.",
      'An account\'s reserved balance (also known as "on hold") is used for identities, proxies, OpenGov preimages and deposits, and it is no longer free.',
    ],
  },
  {
    key: 'help:subscription:balances:spendable',
    title: 'Spendable Balance',
    definition: [
      "Get notified when an account's spendable balance changes.",
      "An account's spendable balance is the free balance that can be spent.",
    ],
  },
  {
    key: 'help:subscription:nominationPools:commission',
    title: 'Commission Changed',
    definition: [
      "Get notified when your nomination pool's commission setting has changed.",
      'A larger commission percentage may indicate that you will receive less rewards, as the nomination pool will take a bigger cut of rewards at the end of each era.',
    ],
  },
  {
    key: 'help:subscription:nominationPools:name',
    title: 'Pool Name Changed',
    definition: [
      "Get notified when your nomination pool's name has changed when a new era starts.",
    ],
  },
  {
    key: 'help:subscription:nominationPools:state',
    title: 'Pool State Changed',
    definition: [
      'Get notified when your nomination pool has changed its state setting when a new era starts.',
      'The "Open" state means anyone can join the pool and no members can be permissionlessly removed.',
      'The "Blocked" state means that no members can join the pool, and some admin roles can permissionlessly kick (unbond) members.',
      'The "Destroying" state means that no members can join the pool, and all members can be permissionlessly removed',
    ],
  },
  {
    key: 'help:subscription:nominationPools:roles',
    title: 'Roles Changed',
    definition: [
      'Get notified when your nomination pool has changed its roles setting when a new era starts.',
    ],
  },
  {
    key: 'help:subscription:nominationPools:rewards',
    title: 'Unclaimed Rewards',
    definition: [
      'Get notified when you have unclaimed nomination pool rewards, when a new era starts.',
    ],
  },
  {
    key: 'help:subscription:nominating:commission',
    title: 'Commission Changed',
    definition: [
      'Get notified when a commission change is detected among your nominated validators, when a new era starts.',
      'You will be notified when your cached commissions do not match the commissions fetched in the latest era.',
    ],
  },
  {
    key: 'help:subscription:nominating:exposure',
    title: 'Exposure Changed',
    definition: [
      'Get notified when your nominating exposure changes when a new era starts.',
      'Your address is "exposed" in the current era when at least one of your nominated validators are selected to actively participate in consensus, and have a chance of receiving rewards.',
    ],
  },
  {
    key: 'help:subscription:nominating:payouts',
    title: 'Era Rewards',
    definition: [
      'Get notified of your nominating rewards from the previous era.',
      'Polkadot Live will calculate your rewards in a decentralized way, fetching required state from the network.',
    ],
  },
  {
    key: 'help:subscription:nominating:nominations',
    title: 'Nominations Changed',
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
      "When enabled, the main window is displayed below the app's tray icon with a fixed size and position. Disable this setting to freely resize and reposition the main window.",
    ],
  },
  {
    key: 'help:settings:showOnAllWorkspaces',
    title: 'Show On All Workspaces',
    definition: [
      'Displays Polkadot Live windows across all workspaces. Disable this setting to limit the application to a single workspace.',
    ],
  },
  {
    key: 'help:settings:silenceOsNotifications',
    title: 'Silence OS Notifications',
    definition: [
      'Enables application-wide silencing of native OS notifications. This global setting overrides notification preferences for individual subscriptions.',
    ],
  },
  {
    key: 'help:settings:showDebuggingSubscriptions',
    title: 'Show Debugging Subscriptions',
    definition: [
      'Shows debugging subscriptions. Enables subscribing to the most recent slot and timestamp on the network.',
    ],
  },
  {
    key: 'help:settings:enableAutomaticSubscriptions',
    title: 'Enable Automatic Subscriptions',
    definition: [
      'Automatically enable all available subscriptions for an account upon import. Disable this setting to start with no subscriptions and manage them individually.',
    ],
  },
  {
    key: 'help:settings:enablePolkassembly',
    title: 'Enable Polkassembly Data',
    definition: [
      'Enables fetching OpenGov metadata from the Polkassembly API, including proposal titles and descriptions. This setting is recommended for browsing and subscribing to OpenGov referenda.',
    ],
  },
  {
    key: 'help:settings:hideDockIcon',
    title: 'Hide Dock Icon',
    definition: [
      'When enabled, the Polkadot Live application icon is hidden from the Dock (macOS) or Taskbar (Windows).',
    ],
  },
  {
    key: 'help:settings:keepOutdatedEvents',
    title: 'Keep Outdated Events',
    definition: [
      'Keep this setting enabled to retain old event items when new ones arrive for subscriptions. Disable it to remove outdated items, showing only the latest notifications. This can be useful if you have many subscriptions and prefer to see only current events.',
    ],
  },
  {
    key: 'help:settings:silenceExtrinsicsOsNotifications',
    title: 'Silence OS Notifications for Extrinsics',
    definition: [
      'Enable to silence native OS notifications for submitted extrinsics. Notifications will not appear when an extrinsic changes status, such as when it is included in a block or finalized.',
    ],
  },
  {
    key: 'help:settings:importData',
    title: 'Import Data',
    definition: [
      'Restore your Polkadot Live state by importing a backup file. Imported data includes accounts, events, and classic subscriptions.',
    ],
  },
  {
    key: 'help:settings:exportData',
    title: 'Export Data',
    definition: [
      'Export your Polkadot Live state to a backup file. Imported addresses, event items, and enabled classic subscriptions will be saved.',
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
      'Last Updated: 3rd October 2024',
      'This policy outlines how data is handled in Polkadot Live and ensures that your personal information is protected.',
      '#Data Collection',
      'Polkadot Live uses Umami Analytics to collect anonymous usage data. Umami is a privacy-focused, open-source analytics tool that does not track personal data or use cookies.',
      '#What Data Is Collected',
      'Anonymous Usage Data: Anonymous data is collected such as the pages visited, the duration of the visit, and user interactions with the program.',
      'Non-Identifiable Information: No personally identifiable information (PII), such as your name or email is collected or stored. Umami is configured to anonymize all user data.',
      '#How This Data Is Used',
      'Collected data provides insights into how users interact with the program. This information can be used to improve features, enhance performance, and optimize the overall user experience.',
      '#Data Storage',
      'All data is stored anonymously, and no personal data is shared with third parties. User privacy is protected where no identifiable information is stored.',
      '#Your Privacy Rights',
      'As no personal information is collected, there is no need for users to opt out of data collection or request the deletion of personal data. You can use the program with full assurance that your privacy is respected at all times.',
      '#Contact Us',
      'If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us through the Polkadot Live repository on GitHub.',
    ],
  },
  {
    key: 'help:summary:accounts',
    title: 'Accounts Summary',
    definition: [
      'Displays the total number of accounts managed by the application, along with a breakdown by import method.',
    ],
  },
  {
    key: 'help:summary:events',
    title: 'Events Summary',
    definition: [
      'Displays the total number of events received. Individual stat boxes display totals by event category.',
    ],
  },
  {
    key: 'help:summary:extrinsics',
    title: 'Extrinsics Summary',
    definition: [
      'Displays the total number of pending and finalized extrinsics managed by the application.',
    ],
  },
  {
    key: 'help:summary:subscriptions',
    title: 'Subscriptions Summary',
    definition: [
      'Displays the total number of active subscriptions. Separate stat boxes display active subscriptions per account, along with a dedicated stat box for active referenda subscriptions when enabled.',
    ],
  },
  {
    key: 'help:chainEvents:Balances:Transfer',
    title: 'Transfer',
    definition: ['A transfer on the network succeeded.'],
  },
  {
    key: 'help:chainEvents:Balances:Reserved',
    title: 'Reserved',
    definition: ['Some balance was reserved (moved from free to reserved).'],
  },
  {
    key: 'help:chainEvents:Balances:Unreserved',
    title: 'Unreserved',
    definition: ['Some balance was unreserved (moved from reserved to free).'],
  },
  {
    key: 'help:chainEvents:Balances:Deposit',
    title: 'Deposit',
    definition: ['Some amount was deposited (e.g. for transaction fees).'],
  },
  {
    key: 'help:chainEvents:Balances:Withdraw',
    title: 'Withdraw',
    definition: [
      'Some amount was withdrawn from the account (e.g. for transaction fees).',
    ],
  },
  {
    key: 'help:chainEvents:Balances:Slashed',
    title: 'Slashed',
    definition: [
      'Some amount was removed from the account (e.g. for misbehavior).',
    ],
  },
  {
    key: 'help:chainEvents:Balances:Suspended',
    title: 'Suspended',
    definition: [
      'Some amount was suspended from an account (it can be restored later).',
    ],
  },
  {
    key: 'help:chainEvents:Balances:Restored',
    title: 'Restored',
    definition: ['Some amount was restored into an account.'],
  },
  {
    key: 'help:chainEvents:Balances:Locked',
    title: 'Locked',
    definition: ['Some balance was locked.'],
  },
  {
    key: 'help:chainEvents:Balances:Unlocked',
    title: 'Unlocked',
    definition: ['Some balance was unlocked.'],
  },
  {
    key: 'help:chainEvents:Balances:Frozen',
    title: 'Frozen',
    definition: ['Some balance was frozen.'],
  },
  {
    key: 'help:chainEvents:Balances:Thawed',
    title: 'Thawed',
    definition: ['Some balance was thawed.'],
  },
  {
    key: 'help:chainEvents:ConvictionVoting:Delegated',
    title: 'Delegated',
    definition: ['An account has delegated their vote to another account.'],
  },
  {
    key: 'help:chainEvents:ConvictionVoting:Undelegated',
    title: 'Undelegated',
    definition: ['An account has canceled a previous delegation operation.'],
  },
  {
    key: 'help:chainEvents:ConvictionVoting:Voted',
    title: 'Voted',
    definition: ['An account has voted.'],
  },
  {
    key: 'help:chainEvents:ConvictionVoting:VoteRemoved',
    title: 'Vote Removed',
    definition: ['A vote has been removed.'],
  },
  {
    key: 'help:chainEvents:ConvictionVoting:VoteUnlocked',
    title: 'Vote Unlocked',
    definition: [
      'The lockup period of a conviction vote expired, and the funds have been unlocked.',
    ],
  },
  {
    key: 'help:chainEvents:NominationPools:Created',
    title: 'Created',
    definition: ['A pool has been created.'],
  },
  {
    key: 'help:chainEvents:NominationPools:Bonded',
    title: 'Bonded',
    definition: ['A member has became bonded in a pool.'],
  },
  {
    key: 'help:chainEvents:NominationPools:PaidOut',
    title: 'Paid Out',
    definition: ['A payout has been made to a member.'],
  },
  {
    key: 'help:chainEvents:NominationPools:Unbonded',
    title: 'Unbonded',
    definition: ['A member has unbonded from their pool.'],
  },
  {
    key: 'help:chainEvents:NominationPools:Withdrawn',
    title: 'Withdrawn',
    definition: ['A member has withdrawn from their pool.'],
  },
  {
    key: 'help:chainEvents:NominationPools:Destroyed',
    title: 'Destroyed',
    definition: ['A pool has been destroyed.'],
  },
  {
    key: 'help:chainEvents:NominationPools:StateChanged',
    title: 'State Changed',
    definition: ['The state of a pool has changed.'],
  },
  {
    key: 'help:chainEvents:NominationPools:MemberRemoved',
    title: 'Member Removed',
    definition: [
      'A member has been removed from a pool.',
      'The removal can be voluntary (withdrawn all unbonded funds) or involuntary (kicked). Any funds that are still delegated are released.',
    ],
  },
  {
    key: 'help:chainEvents:NominationPools:PoolSlashed',
    title: 'Pool Slashed',
    definition: ['The active balance of a pool has been slashed.'],
  },
  {
    key: 'help:chainEvents:NominationPools:UnbondingPoolSlashed',
    title: 'Unbonding Pool Slashed',
    definition: ['The unbonded pool has been slashed to a newe balance.'],
  },
  {
    key: 'help:chainEvents:NominationPools:PoolCommissionUpdated',
    title: 'Pool Commission Updated',
    definition: ["A pool's commission setting has been changed."],
  },
  {
    key: 'help:chainEvents:NominationPools:PoolCommissionChangeRateUpdated',
    title: 'Pool Commission Change Rate Updated',
    definition: ["A pool's commission change rate has been changed."],
  },
  {
    key: 'help:chainEvents:NominationPools:PoolCommissionClaimPermissionUpdated',
    title: 'Pool Commission Claim Permission Updated',
    definition: ['Pool commission claim permission has been updated.'],
  },
  {
    key: 'help:chainEvents:NominationPools:PoolCommissionClaimed',
    title: 'Pool Commission Claimed',
    definition: ['Pool commission has been claimed.'],
  },
  {
    key: 'help:chainEvents:NominationPools:MetadataUpdated',
    title: 'Metadata Updated',
    definition: ["A pool's metadata was updated."],
  },
  {
    key: 'help:chainEvents:Referenda:Approved',
    title: 'Referendum Approved',
    definition: [
      'A referendum has been approved and its proposal has been scheduled.',
    ],
  },
  {
    key: 'help:chainEvents:Referenda:Canceled',
    title: 'Referendum Canceled',
    definition: ['A referendum has been canceled.'],
  },
  {
    key: 'help:chainEvents:Referenda:ConfirmAborted',
    title: 'Referendum Confirmation Aborted',
    definition: ["A referendum's confirmation phase has been aborted."],
  },
  {
    key: 'help:chainEvents:Referenda:ConfirmStarted',
    title: 'Referendum Confirmation Started',
    definition: ['A referendum has moved into the confirmation phase.'],
  },
  {
    key: 'help:chainEvents:Referenda:Confirmed',
    title: 'Referendum Confirmed',
    definition: [
      'A referendum has ended its confirmation phase and is ready for approval.',
    ],
  },
  {
    key: 'help:chainEvents:Referenda:DecisionDepositPlaced',
    title: 'Decision Deposit Placed',
    definition: ['The decision deposit has been placed for a referendum.'],
  },
  {
    key: 'help:chainEvents:Referenda:DecisionDepositRefunded',
    title: 'Decision Deposit Refunded',
    definition: ['The decision deposit has been refunded for a referendum.'],
  },
  {
    key: 'help:chainEvents:Referenda:DecisionStarted',
    title: 'Decision Phase Started',
    definition: ['A referendum has moved into the deciding phase.'],
  },
  {
    key: 'help:chainEvents:Referenda:DepositSlashed',
    title: 'Deposit Slashed',
    definition: ["A referendum's deposit has been slashed."],
  },
  {
    key: 'help:chainEvents:Referenda:Killed',
    title: 'Referendum Killed',
    definition: ['A referendum has been killed.'],
  },
  {
    key: 'help:chainEvents:Referenda:Rejected',
    title: 'Referendum Rejected',
    definition: ['A proposal has been rejected by referendum.'],
  },
  {
    key: 'help:chainEvents:Referenda:SubmissionDepositRefunded',
    title: 'Submission Deposit Refunded',
    definition: ["A referendum's submission deposit has been refunded."],
  },
  {
    key: 'help:chainEvents:Referenda:Submitted',
    title: 'Referendum Submitted',
    definition: ['A referendum has been submitted.'],
  },
  {
    key: 'help:chainEvents:Referenda:TimedOut',
    title: 'Referendum Timed Out',
    definition: ['A referendum has been timed out without being decided.'],
  },
  {
    key: 'help:chainEvents:Staking:EraPaid',
    title: 'Era Paid',
    definition: ['The era payout has been set.'],
  },
  {
    key: 'help:chainEvents:Staking:Rewarded',
    title: 'Nominator Rewarded',
    definition: ['The nominator has been rewarded by this amount.'],
  },
  {
    key: 'help:chainEvents:Staking:Slashed',
    title: 'Staker Slashed',
    definition: [
      'A staker (validator or nominator) has been slashed by the given amount.',
    ],
  },
  {
    key: 'help:chainEvents:Staking:Bonded',
    title: 'Bonded',
    definition: ['An account has bonded an amount.'],
  },
  {
    key: 'help:chainEvents:Staking:Unbonded',
    title: 'Unbonded',
    definition: ['An account has unbonded an amount.'],
  },
  {
    key: 'help:chainEvents:Staking:Kicked',
    title: 'Nominator Kicked',
    definition: ['A nominator has been kicked from a validator.'],
  },
  {
    key: 'help:chainEvents:Staking:Chilled',
    title: 'Account Chilled',
    definition: [
      'An account has stopped participating as either a validator or nominator.',
    ],
  },
  {
    key: 'help:chainEvents:Staking:ValidatorPrefsSet',
    title: 'Validator Preferences Set',
    definition: ['A validator has set their preferences.'],
  },
];
