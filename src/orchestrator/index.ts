// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Subject } from 'rxjs';
import {
  removeChainApiCheck,
  reportAllWindows,
  reportImportedAccounts,
} from '@/utils/SystemUtils';
import { ChainList } from '@/config/chains';
import { APIsController } from '@/controller/APIsController';
import { AccountsController } from '@/controller/AccountsController';
import { Discover } from '@/controller/Discover';
import { BlockStreamsController } from '@/controller/BlockStreamsController';
import { NotificationsController } from '@/controller/NotificationsController';
import type {
  ImportNewAddressArg,
  OrchestratorArg,
  RemoveImportedAccountArg,
} from '@/types/orchestrator';
import * as AccountUtils from '@/utils/AccountUtils';

// Initialise RxJS subject to orchestrate app events.
export const orchestrator = new Subject<OrchestratorArg>();

orchestrator.subscribe({
  next: async ({ task, data = {} }) => {
    switch (task) {
      // Initialize app: should only be called once when the app is starting up.
      case 'initialize':
        await initialize();
        break;
      // Handle new account import.
      case 'newAddressImported':
        await importNewAddress(data);
        break;
      // Handle remove imported account.
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
  AccountsController.initialize();

  // Initialize required chain `APIs` from persisted state.
  await APIsController.initialize();

  // Initialize account chainState and config (requires api controller)
  await AccountUtils.initializeConfigsAndChainStates();

  // Initialize discovery of subscriptions for saved accounts.
  BlockStreamsController.initialize();
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
  const account = AccountsController.add(chain, source, address, name);

  // If account was unsuccessfully added, exit early.
  if (!account) return;

  // Report new account to UI immediately (no chain state yet).
  reportAllWindows(reportImportedAccounts);

  // Add chain instance if it does not already exist.
  if (!APIsController.chainExists(chain)) {
    await APIsController.new(ChainList[chain].endpoints.rpc);
  }

  // Trigger Discovery and generate config.
  const config = await Discover.start(chain, account);

  // Update account's config and chain state.
  AccountsController.setAccountConfig(config, account);

  // Add Account to a `BlockStream` service.
  BlockStreamsController.addAccountToService(chain, address);

  // Show notification.
  NotificationsController.accountImported(name);

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
  AccountsController.remove(chain, address);

  // Remove chain's API instance if no more accounts require it
  removeChainApiCheck(chain);

  // Remove config from `Subscriptions`.
  BlockStreamsController.removeAccountFromService(chain, address);

  // Report to all active windows that an address has been removed.
  reportAllWindows(reportImportedAccounts);
};
