// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  getNewFileHandle,
  isFileSystemAccessApiSupported,
  readFile,
  verifyPermission,
  writeFile,
} from './fileSystem';
import { renderToast } from '@polkadot-live/ui/utils';
import type { SettingFlagsAdapter } from './types';
import type { SettingKey } from '@polkadot-live/types/settings';

export const chromeAdapter: SettingFlagsAdapter = {
  syncOnMount: async (): Promise<Map<SettingKey, boolean>> => {
    const data = { type: 'db', task: 'settings:getAll' };
    const ser: string = await chrome.runtime.sendMessage(data);
    const array: [SettingKey, boolean][] = JSON.parse(ser);
    return new Map<SettingKey, boolean>(array);
  },

  handleAnalytics: () => {
    /* empty */
  },

  handleSetting: (setting, isOnline, relayState) => {
    if (!relayState) {
      return;
    }
    switch (setting.key) {
      case 'setting:import-data': {
        const run = async () => {
          const toastId = 'import-data';
          try {
            if (!isFileSystemAccessApiSupported()) {
              renderToast('File Access Not Supported', toastId, 'error');
              return;
            }
            const contents = await readFile();
            relayState('backup:importing', true);
            const result = (await chrome.runtime.sendMessage({
              type: 'dataBackup',
              task: 'importData',
              payload: { contents, isOnline: Boolean(isOnline) },
            })) as boolean;

            relayState('backup:importing', false);
            result
              ? renderToast('Import Successful', toastId, 'success')
              : renderToast('Import Failed', toastId, 'error');
          } catch (err) {
            console.error(err);
            relayState('backup:importing', false);
          }
        };
        run();
        break;
      }
      case 'setting:export-data': {
        const run = async () => {
          const toastId = 'export-data';
          try {
            if (!isFileSystemAccessApiSupported()) {
              renderToast('File Access Not Supported', toastId, 'error');
              return;
            }
            const contents = (await chrome.runtime.sendMessage({
              type: 'dataBackup',
              task: 'exportData',
            })) as string;

            const handle = await getNewFileHandle();
            const isVerified = await verifyPermission(handle, 'readwrite');
            if (isVerified) {
              await writeFile(handle, contents);
              renderToast('Export Successfuly', toastId, 'success');
            } else {
              renderToast('Permissions Not Granted.', toastId, 'error');
            }
          } catch (err) {
            console.error(err);
            (err as Error).name !== 'AbortError' &&
              renderToast('Export Failed', toastId, 'error');
          }
        };
        run();
        break;
      }
      default: {
        chrome.runtime.sendMessage({
          type: 'settings',
          task: 'handleSetting',
          payload: { setting },
        });
        break;
      }
    }
  },

  postSwitchToggle: (setting, value) => {
    const { key } = setting;
    const msg = { type: 'db', task: 'settings:set', key, value };
    chrome.runtime.sendMessage(msg);
  },
};
