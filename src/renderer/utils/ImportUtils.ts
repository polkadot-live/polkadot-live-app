// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigImport } from '@/config/processes/import';
import { Config as ConfigRenderer } from '@/config/processes/renderer';
import { Flip, toast } from 'react-toastify';
import type {
  AccountSource,
  LedgerLocalAddress,
  LocalAddress,
} from '@/types/accounts';
import { getAddressChainId } from '../Utils';
import { IntervalsController } from '@/controller/renderer/IntervalsController';
import type { AnyData } from '@/types/misc';
import type { ChainID } from '@/types/chains';
import type {
  IntervalSubscription,
  SubscriptionTask,
} from '@/types/subscriptions';
import type { IpcTask } from '@/types/communication';
import { AccountsController } from '@/controller/renderer/AccountsController';
import { SubscriptionsController } from '@/controller/renderer/SubscriptionsController';

type ToastType = 'success' | 'error';

/**
 * @name renderToast
 * @summary Utility to render a toastify notification.
 */
export const renderToast = (
  text: string,
  toastType: ToastType,
  toastId: string
) => {
  switch (toastType) {
    case 'success': {
      toast.success(text, {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        closeButton: false,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: 'dark',
        transition: Flip,
        toastId,
      });
      break;
    }
    case 'error': {
      toast.error(text, {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        closeButton: false,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        theme: 'dark',
        transition: Flip,
        toastId,
      });
      break;
    }
  }
};

/**
 * @name renameAccountInStore
 * @summary Updates a stored account's name in the main process.
 */
export const renameAccountInStore = async (
  address: string,
  source: AccountSource,
  newName: string
) => {
  const ipcTask: IpcTask = {
    action: 'raw-account:rename',
    data: { source, address, newName },
  };

  await window.myAPI.rawAccountTask(ipcTask);
};

/**
 * @name postRenameAccount
 * @summary Post a message to the main renderer to process an account rename.
 */
export const postRenameAccount = (address: string, newName: string) => {
  ConfigImport.portImport.postMessage({
    task: 'renderer:account:rename',
    data: {
      address,
      chainId: getAddressChainId(address),
      newName,
    },
  });
};

/**
 * @name validateAccountName
 * @summary Validate an account name received from user input.
 */

export const validateAccountName = (accountName: string): boolean => {
  // Regulare expression for allowed characters in the account name (including spaces).
  const regex = /^[a-zA-Z0-9._-\s]+$/;

  // Check if the length of the nickname is between 3 and 30 characters.
  if (accountName.length < 3 || accountName.length > 20) {
    return false;
  }

  // Check if the account name contains only allowed characters.
  if (!regex.test(accountName)) {
    return false;
  }

  return true;
};

/**
 * @name getSortedLocalAddresses
 * @summary Function to get addresses categorized by chain ID and sorted by name.
 */
export const getSortedLocalAddresses = (addresses: LocalAddress[]) => {
  const sorted = new Map<ChainID, LocalAddress[]>();

  // Insert keys in a preferred order.
  for (const chainId of ['Polkadot', 'Kusama', 'Westend'] as ChainID[]) {
    const filtered = addresses
      .filter((a) => getAddressChainId(a.address) === chainId)
      .sort((a, b) => a.name.localeCompare(b.name));

    if (filtered.length !== 0) {
      sorted.set(chainId, filtered);
    }
  }

  return sorted;
};

/**
 * @name getSortedLocalLedgerAddresses
 * @summary Same as `getSortedLocalAddresses` but for the local Ledger address type.
 */
export const getSortedLocalLedgerAddresses = (
  addresses: LedgerLocalAddress[]
) => {
  const sorted = new Map<ChainID, LedgerLocalAddress[]>();

  // Insert keys in preferred order.
  for (const chainId of ['Polkadot', 'Kusama'] as ChainID[]) {
    const filtered = addresses
      .filter((a) => getAddressChainId(a.address) === chainId)
      .sort((a, b) => a.name.localeCompare(b.name));

    if (filtered.length !== 0) {
      sorted.set(chainId, filtered);
    }
  }

  return sorted;
};

/**
 * @name importIntervalTasks
 * @summary Extract interval task data from an imported text file and send to application.
 * (main renderer)
 */
type IntervalFunc = (t: IntervalSubscription) => void;

export const importIntervalTasks = async (
  serialized: string,
  tryAddIntervalSubscription: IntervalFunc,
  tryUpdateDynamicIntervalTask: IntervalFunc,
  addIntervalSubscription: IntervalFunc,
  updateIntervalSubscription: IntervalFunc
): Promise<void> => {
  const s_tasks = getFromBackupFile('intervals', serialized);
  if (!s_tasks) {
    return;
  }

  // Receive new tasks after persisting them to store.
  const s_data =
    (await window.myAPI.sendIntervalTask({
      action: 'interval:tasks:import',
      data: { serialized: s_tasks },
    })) || '[]';

  // Parse received tasks to insert and update.
  const s_array: [string, string][] = JSON.parse(s_data);
  const map = new Map<string, string>(s_array);

  const inserts: IntervalSubscription[] = JSON.parse(map.get('insert') || '[]');
  const updates: IntervalSubscription[] = JSON.parse(map.get('update') || '[]');

  // Update manage subscriptions in controller and update React state.
  if (inserts.length > 0) {
    IntervalsController.insertSubscriptions(inserts);
    inserts.forEach((t) => {
      tryAddIntervalSubscription(t);
      addIntervalSubscription(t);
    });
  }

  if (updates.length > 0) {
    IntervalsController.removeSubscriptions(updates);
    updates.forEach((t) => {
      t.status === 'enable' && IntervalsController.insertSubscription(t);
      tryUpdateDynamicIntervalTask(t);
      updateIntervalSubscription(t);
    });
  }

  // Update state in OpenGov window.
  if (await window.myAPI.isViewOpen('openGov')) {
    inserts.forEach((t) => {
      ConfigRenderer.portToOpenGov?.postMessage({
        task: 'openGov:task:add',
        data: {
          serialized: JSON.stringify(t),
        },
      });
    });

    updates.forEach((t) => {
      ConfigRenderer.portToOpenGov?.postMessage({
        task: 'openGov:task:update',
        data: {
          serialized: JSON.stringify(t),
        },
      });
    });
  }
};

/**
 * @name importAccountSubscriptions
 * @summary Extract account subscription data from an imported text file and send to application.
 */
export const importAccountSubscriptions = async (
  serialized: string,
  updateRenderedSubscriptions: (task: SubscriptionTask) => void,
  setAccountSubscriptions: (m: Map<string, SubscriptionTask[]>) => void
): Promise<void> => {
  const s_tasks = getFromBackupFile('accountTasks', serialized);
  if (!s_tasks) {
    return;
  }

  const s_array: [string, string][] = JSON.parse(s_tasks);
  const s_map = new Map<string, string>(s_array);

  // Store tasks to persist to store.
  const s_persistMap = new Map<string, string>();

  // Iterate map of serialized tasks keyed by an account address.
  for (const [address, serTasks] of s_map.entries()) {
    const parsed: SubscriptionTask[] = JSON.parse(serTasks);
    if (parsed.length === 0) {
      continue;
    }

    const account = AccountsController.get(parsed[0].chainId, address);
    const valid: SubscriptionTask[] = [];

    if (account) {
      for (const t of parsed) {
        if (
          (t.category === 'Nomination Pools' && !account.nominationPoolData) ||
          (t.category === 'Nominating' && !account.nominatingData)
        ) {
          // Throw away task if necessary.
          continue;
        }

        // Otherwise subscribe to task.
        await account?.subscribeToTask(t);
        updateRenderedSubscriptions(t);
        valid.push(t);
      }
    }

    // Serialize the account's subscribed tasks.
    valid.length > 0 && s_persistMap.set(address, JSON.stringify(valid));
  }

  // Set subscriptions React state.
  setAccountSubscriptions(
    SubscriptionsController.getAccountSubscriptions(AccountsController.accounts)
  );

  // Send successfully imported tasks to main process.
  await window.myAPI.sendSubscriptionTask({
    action: 'subscriptions:account:import',
    data: { serialized: JSON.stringify(Array.from(s_persistMap.entries())) },
  });
};

/**
 * @name getFromBackupFile
 * @summary Get some serialized data from backup files.
 * Key may be `addresses`, `events` or `intervals`.
 */
export const getFromBackupFile = (
  key: string,
  serialized: string
): string | undefined => {
  const s_array: [string, string][] = JSON.parse(serialized);
  const s_map = new Map<string, string>(s_array);
  return s_map.get(key);
};

/**
 * @name postToImport
 * @summary Utility to post a message to the import window.
 * (main renderer)
 */
export const postToImport = (task: string, dataObj: AnyData) => {
  ConfigRenderer.portToImport?.postMessage({ task, data: dataObj });
};
