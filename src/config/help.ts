// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { HelpItems } from '@/renderer/contexts/Help/types';

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
];
