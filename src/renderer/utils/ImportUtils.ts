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
import type { EventCallback } from '@/types/reporter';
import type { IntervalSubscription } from '@/types/subscriptions';
import type { IpcTask } from '@/types/communication';

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
 * @name importAddresses
 * @summary Extract address data from an imported text file and send to application.
 * (main renderer)
 */
export const importAddresses = async (
  serialized: string,
  handleImportAddress: (ev: MessageEvent, fromBackup: boolean) => Promise<void>,
  handleRemoveAddress: (ev: MessageEvent) => Promise<void>
) => {
  const s_addresses = getFromBackupFile('addresses', serialized);
  if (!s_addresses) {
    return;
  }

  const p_array: [AccountSource, string][] = JSON.parse(s_addresses);
  const p_map = new Map<AccountSource, string>(p_array);
  const importWindowOpen = await window.myAPI.isViewOpen('import');

  for (const [source, ser] of p_map.entries()) {
    const parsed =
      source === 'ledger'
        ? (JSON.parse(ser) as LedgerLocalAddress[])
        : (JSON.parse(ser) as LocalAddress[]);

    // Check connection status and set isImported to `false` if app is offline.
    const isOnline: boolean =
      (await window.myAPI.sendConnectionTaskAsync({
        action: 'connection:getStatus',
        data: null,
      })) || false;

    // Process parsed addresses.
    for (const a of parsed) {
      a.isImported && !isOnline && (a.isImported = false);

      // Persist or update address in Electron store.
      await window.myAPI.rawAccountTask({
        action: 'raw-account:import',
        data: { source, serialized: JSON.stringify(a) },
      });

      // Add address and its status to import window's state.
      importWindowOpen &&
        postToImport('import:account:add', { json: JSON.stringify(a), source });

      // Handle importing or removing account from main window and setting `isImported` flag state.
      const { address, name } = a;
      const chainId = getAddressChainId(address);

      if (a.isImported) {
        const data = { data: { data: { address, chainId, name, source } } };
        await handleImportAddress(new MessageEvent('message', data), true);
        postToImport('import:address:update', { address: a, source });
      } else {
        const data = { data: { data: { address, chainId } } };
        await handleRemoveAddress(new MessageEvent('message', data));
        postToImport('import:address:update', { address: a, source });
      }
    }
  }
};

/**
 * @name importEvents
 * @summary Extract event data from an imported text file and send to application.
 * (main renderer)
 */
export const importEvents = async (
  serialized: string,
  setEvents: (events: EventCallback[]) => void
): Promise<void> => {
  const s_events = getFromBackupFile('events', serialized);
  if (!s_events) {
    return;
  }

  // Send serialized events to main for processing.
  const updated = (await window.myAPI.sendEventTaskAsync({
    action: 'events:import',
    data: { events: s_events },
  })) as string;

  const parsed: EventCallback[] = JSON.parse(updated);
  setEvents(parsed);
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
  serialized: string
): Promise<void> => {
  const s_tasks = getFromBackupFile('accountTasks', serialized);
  if (!s_tasks) {
    return;
  }

  // TODO: Persist tasks to store in main process.
  // Receive new tasks after persisting them to store.
  const s_data =
    (await window.myAPI.sendSubscriptionTask({
      action: 'subscriptions:account:import',
      data: { serialized: s_tasks },
    })) || '[]';

  // TODO: Parse received tasks to insert and update.

  // TODO: Subscribe to tasks using orchestrator.

  // TODO: Update React state.

  console.log(s_data);
};

/**
 * @name getFromBackupFile
 * @summary Get some serialized data from backup files.
 * Key may be `addresses`, `events` or `intervals`.
 */
const getFromBackupFile = (
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
const postToImport = (task: string, dataObj: AnyData) => {
  ConfigRenderer.portToImport?.postMessage({ task, data: dataObj });
};
