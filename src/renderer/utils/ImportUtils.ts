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
import type { ChainID } from '@/types/chains';
import type { EventCallback } from '@/types/reporter';
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
export const importAddresses = async (serialized: string) => {
  const s_array: [string, string][] = JSON.parse(serialized);
  const s_map = new Map<string, string>(s_array);
  const s_addresses = s_map.get('addresses');

  if (s_addresses) {
    const p_array: [AccountSource, string][] = JSON.parse(s_addresses);
    const p_map = new Map<AccountSource, string>(p_array);
    const importWindowOpen = await window.myAPI.isViewOpen('import');

    for (const [source, ser] of p_map.entries()) {
      const parsed =
        source === 'ledger'
          ? (JSON.parse(ser) as LedgerLocalAddress[])
          : (JSON.parse(ser) as LocalAddress[]);

      parsed.forEach(async (a) => {
        // Persist addresses to Electron store.
        await window.myAPI.rawAccountTask({
          action: 'raw-account:persist',
          data: { source, serialized: JSON.stringify(a) },
        });

        // Update import window state only if it's open.
        importWindowOpen && postToImport(a, source);
      });
    }
  }
};

/**
 * @name postToImport
 * @summary Utility to post message to import window.
 * (main renderer)
 */
const postToImport = (
  json: LocalAddress | LedgerLocalAddress,
  source: AccountSource
) => {
  ConfigRenderer.portToImport?.postMessage({
    task: 'import:account:add',
    data: { json: JSON.stringify(json), source },
  });
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
  const s_array: [string, string][] = JSON.parse(serialized);
  const s_map = new Map<string, string>(s_array);
  const s_events = s_map.get('events');

  // Send '[]' if no events received.
  const updated = (await window.myAPI.sendEventTaskAsync({
    action: 'events:import',
    data: { events: s_events ? s_events : '[]' },
  })) as string;

  const parsed: EventCallback[] = JSON.parse(updated);
  setEvents(parsed);
};
