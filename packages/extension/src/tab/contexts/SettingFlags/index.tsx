// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createContext, useEffect, useRef, useState } from 'react';
import { createSafeContextHook } from '@polkadot-live/contexts';
import { getDefaultSettings } from '@polkadot-live/consts/settings';
import { setStateWithRef } from '@w3ux/utils';
import type { SettingFlagsContextInterface } from './types';
import type { SettingKey, SettingItem } from '@polkadot-live/types/settings';
import {
  getNewFileHandle,
  isFileSystemAccessApiSupported,
  readFile,
  verifyPermission,
  writeFile,
} from './fileSystem';
import { useConnections } from '../../../contexts';
import { renderToast } from '@polkadot-live/ui/utils';

export const SettingFlagsContext = createContext<
  SettingFlagsContextInterface | undefined
>(undefined);

export const useSettingFlags = createSafeContextHook(
  SettingFlagsContext,
  'SettingFlagsContext'
);

export const SettingFlagsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { relayState, getOnlineMode } = useConnections();
  const [cache, setCache] = useState(getDefaultSettings());
  const cacheRef = useRef(cache);

  /**
   * Get value from cache.
   */
  const cacheGet = (key: SettingKey): boolean =>
    Boolean(cacheRef.current.get(key));

  /**
   * Set value in cache.
   */
  const cacheSet = (key: SettingKey, val: boolean) => {
    const map = new Map(cacheRef.current).set(key, val);
    setStateWithRef(map, setCache, cacheRef);
  };

  /**
   * Determine if a swtich is on or off.
   */
  const getSwitchState = (setting: SettingItem) => {
    const { key } = setting;
    return cacheGet(key);
  };

  /**
   * Handle toggling a setting switch.
   */
  const handleSwitchToggle = (setting: SettingItem) => {
    const { key } = setting;
    const value = !cacheGet(key);
    const map = new Map(cacheRef.current).set(key, value);
    setStateWithRef(map, setCache, cacheRef);

    const msg = { type: 'db', task: 'settings:set', key, value };
    chrome.runtime.sendMessage(msg);
  };

  /**
   * Handle a setting action.
   */
  const handleSetting = (setting: SettingItem) => {
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
              payload: { contents, isOnline: getOnlineMode() },
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
  };

  /**
   * Sync settings with main process on mount.
   */
  useEffect(() => {
    const sync = async () => {
      const data = { type: 'db', task: 'settings:getAll' };
      const ser: string = await chrome.runtime.sendMessage(data);
      const array: [SettingKey, boolean][] = JSON.parse(ser);
      const map = new Map<SettingKey, boolean>(array);
      setStateWithRef(map, setCache, cacheRef);
    };

    sync();
  }, []);

  return (
    <SettingFlagsContext
      value={{
        cacheSet,
        getSwitchState,
        handleSwitchToggle,
        handleSetting,
      }}
    >
      {children}
    </SettingFlagsContext>
  );
};
