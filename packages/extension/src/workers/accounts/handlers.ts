// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../../controllers';
import { dispatchNotification } from '../notifications';
import { eventBus } from '../eventBus';
import {
  persistManagedAccount,
  removeManagedAccount,
} from '../managedAccounts';
import { sendChromeMessage } from '../utils';
import {
  setAccountSubscriptionsState,
  updateAccountSubscriptions,
} from '../subscriptions';
import { updateEventWhoInfo } from '../events';
import {
  AccountsController,
  APIsController,
  disconnectAPIs,
  SubscriptionsController,
} from '@polkadot-live/core';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  EncodedAccount,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';

export const handleImportAddress = async (
  generic: ImportedGenericAccount,
  encoded: EncodedAccount,
  onlineMode: boolean,
  fromBackup: boolean
) => {
  const relayFlag = (key: string, value: boolean) =>
    sendChromeMessage('sharedState', 'relay', { key, value });

  try {
    relayFlag('account:importing', true);
    const { address, alias, chainId } = encoded;
    const { source } = generic;
    let account = AccountsController.add(encoded, source) || undefined;
    account && (await persistManagedAccount(account));

    // Unsubscribe all tasks if the account exists and is being re-imported.
    if (fromBackup && !account) {
      account = AccountsController.get(chainId, address);
      if (account) {
        // Update account name with one in backup file.
        if (alias !== account.name) {
          account.name = alias;
          await AccountsController.set(account);
        }
        // Remove subscriptions then update database and state.
        const fn = SubscriptionsController.buildSubscriptions;
        await updateAccountSubscriptions(fn(account, 'disable'));
        await setAccountSubscriptionsState();
      }
    }

    // Return if account already exists and isn't being re-imported.
    if (!account) {
      relayFlag('account:importing', false);
      return;
    }

    // Sync managed account data if online.
    if (onlineMode) {
      const res = await APIsController.getConnectedApiOrThrow(chainId);
      const api = res.getApi();
      await AccountsController.syncAccount(account, api);
    }

    // Subscribe new account to all possible subscriptions if setting enabled.
    if (account.queryMulti && !fromBackup) {
      const key = 'setting:automatic-subscriptions';
      const auto = (await DbController.get('settings', key)) as boolean;
      const status = auto ? 'enable' : 'disable';
      const tasks = SubscriptionsController.buildSubscriptions(account, status);
      await updateAccountSubscriptions(tasks);
      await setAccountSubscriptionsState();
    }

    // Update addresses state and show notification.
    if (!fromBackup) {
      eventBus.dispatchEvent(new CustomEvent('setManagedAccountsState'));
      const id = `import:${address}`;
      dispatchNotification(id, 'Subscriptions Added', account.name);
    }

    // Send message back to import window to reset account's processing flag.
    relayFlag('account:importing', false);
    const payload = { encoded, generic, status: false, success: true };
    sendChromeMessage('rawAccount', 'setProcessing', payload);
  } catch (err) {
    console.error(err);
    relayFlag('account:importing', false);
    const payload = { encoded, generic, status: false, success: false };
    sendChromeMessage('rawAccount', 'setProcessing', payload);
  }
};

export const handleRemoveAddress = async (
  address: string,
  chainId: ChainID
) => {
  try {
    const account = AccountsController.get(chainId, address);
    if (!account) {
      console.log('Account could not be fetched, probably not imported yet');
      return;
    }
    // Unsubscribe from tasks and remove account from controller.
    await AccountsController.removeAllSubscriptions(account);
    AccountsController.remove(chainId, address);
    await removeManagedAccount(account);

    // Sync managed accounts state.
    eventBus.dispatchEvent(new CustomEvent('setManagedAccountsState'));

    const key = `${chainId}:${address}`;
    await DbController.delete('accountSubscriptions', key);
    await setAccountSubscriptionsState();

    // Transition away from rendering toggles.
    sendChromeMessage('subscriptions', 'clearRenderedSubscriptions');

    // Disconnect from any API instances that are not currently needed.
    await disconnectAPIs();
  } catch (err) {
    console.error(err);
  }
};

export const handleRenameAccount = async (enAccount: EncodedAccount) => {
  const { address, alias: newName, chainId } = enAccount;
  const account = AccountsController.get(chainId, address);
  if (account) {
    // Set new account name and persist new account data to storage.
    account.name = newName;
    await AccountsController.set(account);
    await persistManagedAccount(account);

    // Update cached account name in subscription tasks.
    const flattened = account.flatten();
    flattened.name = newName;
    account.queryMulti?.updateEntryAccountData(chainId, flattened);

    // Sync managed accounts state.
    eventBus.dispatchEvent(new CustomEvent('setManagedAccountsState'));

    // Update subscription task react state.
    sendChromeMessage('subscriptions', 'updateAccountName', {
      key: `${chainId}:${address}`,
      newName,
    });
  }
  // Update events in database and react state.
  sendChromeMessage('events', 'updateAccountNames', {
    chainId,
    updated: await updateEventWhoInfo(address, chainId, newName),
  });

  // Update account name in extrinsics window.
  const payload = { address, chainId, newName };
  sendChromeMessage('extrinsics', 'updateAccountNames', payload);
};
