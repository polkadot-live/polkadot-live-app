// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigImport, ConfigRenderer } from '../config';
import type {
  AccountSource,
  LedgerLocalAddress,
  LocalAddress,
} from '@polkadot-live/types/accounts';
import { getAddressChainId } from '../library/AccountsLib';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';
import type { IpcTask } from '@polkadot-live/types/communication';

/**
 * @name renameAccountInStore
 * @summary Updates a stored account's name in the main process.
 */
export const renameAccountInStore = async (
  publicKeyHex: string,
  source: AccountSource,
  newName: string
) => {
  const ipcTask: IpcTask = {
    action: 'raw-account:rename',
    data: { newName, publicKeyHex, source },
  };

  await window.myAPI.rawAccountTask(ipcTask);
};

/**
 * @name postRenameAccount
 * @summary Post a message to main renderer to process an account rename.
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
 * @name getSortedLocalAddresses
 * @summary Function to get addresses categorized by chain ID and sorted by name.
 */
export const getSortedLocalAddresses = (addresses: LocalAddress[]) => {
  const sorted = new Map<ChainID, LocalAddress[]>();

  // Insert keys in a preferred order.
  for (const chainId of [
    'Polkadot',
    'Kusama',
    'Westend Asset Hub',
  ] as ChainID[]) {
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
 * @name postToExtrinsics
 * @summary Utility to post a message to the extrinsics window.
 * (main renderer)
 */
export const postToExtrinsics = (task: string, dataObj: AnyData) => {
  ConfigRenderer.portToAction?.postMessage({ task, data: dataObj });
};
/**
 * @name postToImport
 * @summary Utility to post a message to the import window.
 * (main renderer)
 */
export const postToImport = (task: string, dataObj: AnyData) => {
  ConfigRenderer.portToImport?.postMessage({ task, data: dataObj });
};

/**
 * @name postToOpenGov
 * @summary Utility to post a message to the OpenGov window.
 * (main renderer)
 */
export const postToOpenGov = (task: string, dataObj: AnyData) => {
  ConfigRenderer.portToOpenGov?.postMessage({ task, data: dataObj });
};

/**
 * @name postToSettings
 * @summary Utility to post a message to the Settings window.
 * (main renderer)
 */
export const postToSettings = (task: string, dataObj: AnyData) => {
  ConfigRenderer.portToSettings?.postMessage({ task, data: dataObj });
};
