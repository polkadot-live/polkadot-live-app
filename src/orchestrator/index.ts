// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Notification } from 'electron';
import { Subject } from 'rxjs';
import { reportAllWindows, reportImportedAccounts } from '@/main';
import { ChainList } from '@/config/chains';
import { APIs } from '@/controller/APIs';
import { Accounts } from '@/controller/Accounts';
import { Discover } from '@/controller/Discover';
import { Subscriptions } from '@/controller/Subscriptions';
import {
  ImportNewAddressArg,
  OrchestratorArg,
  RemoveImportedAccountArg,
} from '@polkadot-live/types';

// Initialise RxJS subject to orchestrate app events.
export const orchestrator = new Subject<OrchestratorArg>();

orchestrator.subscribe({
  next: ({ task, data = {} }) => {
    switch (task) {
      case 'initialize':
        initialize();
        break;
      case 'newAddressImported':
        importNewAddress(data);
        break;
      case 'removeImportedAccount':
        removeImportedAccount(data);
        break;
      default:
        break;
    }
  },
});

/**
 * @name initialize
 * @summary Initializes app state.
 */
const initialize = async () => {
  // Initialize `Accounts` from persisted state.
  Accounts.initialize();

  // Initialize required chain `APIs` from persisted state.
  await APIs.initialize();

  // Initialize discovery of subscriptions for saved accounts..
  Subscriptions.initialize();
};

/**
 * @name importNewAddress
 * @summary Imports a new account.
 */
const importNewAddress = async ({
  chain,
  source,
  address,
  name,
}: ImportNewAddressArg) => {
  // Add address to `Accounts` and give immediate feedback to app.
  const account = Accounts.add(chain, source, address, name);

  // If account was unsuccessfully added, exit early.
  if (!account) return;

  // Report new account to UI immediately (no chain state yet).
  reportAllWindows(reportImportedAccounts);

  // Add chain instance if it does not already exist.
  if (!APIs.chainExists(chain)) {
    await APIs.new(ChainList[chain].endpoints.rpc);
  }

  // Trigger Discovery and generate config.
  const config = await Discover.start(chain, account);

  // Update account's config and chain state.
  Accounts.setAccountConfig(config, account);

  // Add Account to a `BlockStream` service.
  Subscriptions.addAccountToService(chain, address);

  // Show notification.
  new Notification({
    title: 'New Account Imported',
    body: `${name} was imported successfully.`,
  }).show();

  // Report account again with chain state.
  reportAllWindows(reportImportedAccounts);
};

/**
 * @name removeImportedAccount
 * @summary Removes an imported account.
 */
const removeImportedAccount = ({
  chain,
  address,
}: RemoveImportedAccountArg) => {
  // Remove address from store.
  Accounts.remove(chain, address);

  // Remove config from `Subscriptions`.
  Subscriptions.removeAccountFromService(chain, address);

  // Report to all active windows that an address has been removed.
  reportAllWindows(reportImportedAccounts);
};
