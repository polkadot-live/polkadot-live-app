// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ConfigRenderer } from '../config';
import type { AnyData } from '@polkadot-live/types/misc';

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
  ConfigRenderer.portToTabs?.postMessage({ task, data: dataObj });
};
/**
 * @name postToImport
 * @summary Utility to post a message to the import window.
 * (main renderer)
 */
export const postToImport = (task: string, dataObj: AnyData) => {
  ConfigRenderer.portToTabs?.postMessage({ task, data: dataObj });
};

/**
 * @name postToOpenGov
 * @summary Utility to post a message to the OpenGov window.
 * (main renderer)
 */
export const postToOpenGov = (task: string, dataObj: AnyData) => {
  ConfigRenderer.portToTabs?.postMessage({ task, data: dataObj });
};

/**
 * @name postToSettings
 * @summary Utility to post a message to the Settings window.
 * (main renderer)
 */
export const postToSettings = (task: string, dataObj: AnyData) => {
  ConfigRenderer.portToTabs?.postMessage({ task, data: dataObj });
};
