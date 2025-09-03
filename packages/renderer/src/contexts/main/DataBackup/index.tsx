// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/// Dependencies.
import * as Core from '@polkadot-live/core';
import { createContext } from 'react';
import { createSafeContextHook } from '@polkadot-live/ui/utils';
import {
  AccountsController,
  IntervalsController,
  SubscriptionsController,
} from '@polkadot-live/core';

/// Main window contexts.
import { useConnections } from '@ren/contexts/common';
import { useEvents } from '@ren/contexts/main';
import { useManage } from '../Manage';
import { useIntervalSubscriptions } from '../IntervalSubscriptions';

/// Types.
import type {
  DataBackupContextInterface,
  ImportFunc,
  RemoveFunc,
} from './types';
import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type { ChainID } from '@polkadot-live/types/chains';
import type { EventCallback } from '@polkadot-live/types/reporter';
import type { ExportResult, ImportResult } from '@polkadot-live/types/backup';
import type {
  IntervalSubscription,
  SubscriptionTask,
} from '@polkadot-live/types/subscriptions';

export const DataBackupContext = createContext<
  DataBackupContextInterface | undefined
>(undefined);

export const useDataBackup = createSafeContextHook(
  DataBackupContext,
  'DataBackupContext'
);

export const DataBackupProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { getOnlineMode } = useConnections();
  const { setEvents } = useEvents();

  const { tryAddIntervalSubscription, tryUpdateDynamicIntervalTask } =
    useManage();

  const { addIntervalSubscription, updateIntervalSubscription } =
    useIntervalSubscriptions();

  /**
   * Write Polkadot Live data to a file.
   */
  const exportDataToBackup = async () => {
    const { result, msg }: ExportResult = await window.myAPI.exportAppData();

    // Render toastify message in settings window.
    switch (msg) {
      case 'success': {
        Core.postToSettings('settings:render:toast', {
          success: result,
          text: 'Data exported successfully.',
        });
        break;
      }
      case 'alreadyOpen': {
        // Don't do anything.
        break;
      }
      case 'canceled': {
        // Don't do anything on cancel.
        break;
      }
      case 'error': {
        Core.postToSettings('settings:render:toast', {
          success: result,
          text: 'Data export error.',
        });
        break;
      }
      case 'executing': {
        Core.postToSettings('settings:render:toast', {
          success: result,
          text: 'Export dialog is already open.',
        });
        break;
      }
      default: {
        throw new Error('Message not recognized');
      }
    }
  };

  /**
   * Exported function for importing data from a backup file.
   */
  const importDataFromBackup = async (
    handleImportAddress: ImportFunc,
    handleRemoveAddress: RemoveFunc
  ) => {
    const response: ImportResult = await window.myAPI.importAppData();

    switch (response.msg) {
      case 'success': {
        // Broadcast importing flag.
        window.myAPI.relaySharedState('backup:importing', true);

        try {
          if (!response.data) {
            throw new Error('No import data.');
          }

          // Import serialized data.
          const { serialized: s } = response.data;
          await importAddressData(s, handleImportAddress, handleRemoveAddress);
          await updateTaskEntries();

          await importEventData(s);
          await importIntervalData(s);
          await importAccountTaskData(s);
          await importExtrinsicsData(s);

          Core.postToSettings('settings:render:toast', {
            success: response.result,
            text: 'Data imported successfully.',
          });
        } catch (err) {
          Core.postToSettings('settings:render:toast', {
            success: false,
            text: 'Error parsing JSON.',
          });
        }

        // Broadcast importing flag.
        window.myAPI.relaySharedState('backup:importing', false);
        break;
      }
      case 'alreadyOpen': {
        // Don't do anything.
        break;
      }
      case 'canceled': {
        // Don't do anything on cancel.
        break;
      }
      case 'error': {
        Core.postToSettings('settings:render:toast', {
          success: response.result,
          text: 'Data import error.',
        });
        break;
      }
      default: {
        throw new Error('Message not recognized');
      }
    }
  };

  /**
   * Import account data from backup file.
   */
  const importAddressData = async (
    serialized: string,
    handleImportAddress: ImportFunc,
    handleRemoveAddress: RemoveFunc
  ) => {
    const s_addresses = Core.getFromBackupFile('addresses', serialized);
    if (!s_addresses) {
      return;
    }

    const p_array: [AccountSource, string][] = JSON.parse(s_addresses);
    const p_map = new Map<AccountSource, string>(p_array);
    const importWindowOpen = await window.myAPI.isViewOpen('import');
    const isOnline = getOnlineMode();

    for (const [source, ser] of p_map.entries()) {
      const genericAccounts: ImportedGenericAccount[] = JSON.parse(ser);

      // Process parsed addresses.
      for (const genericAccount of genericAccounts) {
        const { encodedAccounts, publicKeyHex } = genericAccount;

        // Iterate encoded accounts and set `isImported` flag.
        for (const en of Object.values(encodedAccounts)) {
          if (en.isImported && !isOnline) {
            const chainId = en.chainId;
            genericAccount.encodedAccounts[chainId].isImported = false;
          }
        }

        // Persist or update generic account in Electron store.
        await window.myAPI.rawAccountTask({
          action: 'raw-account:import',
          data: { serialized: JSON.stringify(genericAccount) },
        });

        // Add address and its status to import window's state.
        importWindowOpen &&
          Core.postToImport('import:account:add', {
            json: JSON.stringify(genericAccount),
            source,
          });

        for (const enAccount of Object.values(encodedAccounts)) {
          // Import or remove encoded accounts from main window.
          const { address, chainId, isImported } = enAccount;
          if (isImported) {
            const data = {
              data: {
                data: {
                  serEncodedAccount: JSON.stringify(enAccount),
                  serGenericAccount: JSON.stringify(genericAccount),
                },
              },
            };
            await handleImportAddress(new MessageEvent('message', data), true);
          } else {
            const data = { data: { data: { address, chainId } } };
            await handleRemoveAddress(new MessageEvent('message', data));
          }

          // Update state in import view.
          Core.postToImport('import:address:update', { genericAccount });

          // Update managed account names.
          const account = AccountsController.get(chainId, publicKeyHex);
          if (account) {
            await AccountsController.set(account);
          }
        }
      }

      // Update account list state.
      AccountsController.syncState();
    }
  };

  /**
   * Import extrinsics data from backup file.
   */
  const importExtrinsicsData = async (serialized: string): Promise<void> => {
    const s_extrinsics = Core.getFromBackupFile('extrinsics', serialized);
    if (!s_extrinsics) {
      return;
    }

    const s_extrinsics_synced = (await window.myAPI.sendExtrinsicsTaskAsync({
      action: 'extrinsics:import',
      data: { serialized: s_extrinsics },
    })) as string;

    Core.postToExtrinsics('action:tx:import', {
      serialized: s_extrinsics_synced,
    });
  };

  /// Extract event data from an imported text file and send to application.
  const importEventData = async (serialized: string): Promise<void> => {
    const s_events = Core.getFromBackupFile('events', serialized);
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
   * Import interval task data from backup file.
   */
  const importIntervalData = async (serialized: string): Promise<void> => {
    const s_tasks = Core.getFromBackupFile('intervals', serialized);
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

    const inserts: IntervalSubscription[] = JSON.parse(
      map.get('insert') || '[]'
    );
    const updates: IntervalSubscription[] = JSON.parse(
      map.get('update') || '[]'
    );
    const isOnline = getOnlineMode();

    // Update manage subscriptions in controller and update React state.
    if (inserts.length > 0) {
      IntervalsController.insertSubscriptions(inserts, isOnline);
      inserts.forEach((t) => {
        tryAddIntervalSubscription(t);
        addIntervalSubscription(t);
      });
    }

    if (updates.length > 0) {
      IntervalsController.removeSubscriptions(updates, isOnline);

      updates.forEach((t) => {
        t.status === 'enable' &&
          IntervalsController.insertSubscription(t, isOnline);
        tryUpdateDynamicIntervalTask(t);
        updateIntervalSubscription(t);
      });
    }

    // Update state in OpenGov window.
    if (await window.myAPI.isViewOpen('openGov')) {
      inserts.forEach((t) => {
        Core.postToOpenGov('openGov:task:add', {
          serialized: JSON.stringify(t),
        });
      });
      updates.forEach((t) => {
        Core.postToOpenGov('openGov:task:update', {
          serialized: JSON.stringify(t),
        });
      });
    }
  };

  /**
   * Updates the account name cache maintained by subscription tasks.
   */
  const updateTaskEntries = async () => {
    for (const [chainId, managed] of AccountsController.accounts.entries()) {
      for (const account of managed) {
        const flattened = account.flatten();
        account.queryMulti?.updateEntryAccountData(chainId, flattened);
      }
    }
  };

  /**
   * Import subscription data from backup file.
   */
  const importAccountTaskData = async (serialized: string) => {
    const s_tasks = Core.getFromBackupFile('accountTasks', serialized);
    if (!s_tasks) {
      return;
    }

    const s_array: [string, string][] = JSON.parse(s_tasks);
    const s_map = new Map<string, string>(s_array);

    // Store tasks to persist to store.
    const s_persistMap = new Map<string, string>();

    // Iterate map of serialized tasks keyed by an account address.
    for (const [key, serTasks] of s_map.entries()) {
      const parsed: SubscriptionTask[] = JSON.parse(serTasks);
      if (parsed.length === 0) {
        continue;
      }

      const [chainId, address] = key.split(':', 2);
      const account = AccountsController.get(chainId as ChainID, address);
      const valid: SubscriptionTask[] = [];

      if (account) {
        for (const t of parsed) {
          if (
            (t.category === 'Nomination Pools' &&
              !account.nominationPoolData) ||
            (t.category === 'Nominating' && !account.nominatingData)
          ) {
            // Throw away task if necessary.
            continue;
          }

          // Otherwise subscribe to task.
          await AccountsController.subscribeTask(t);
          SubscriptionsController.updateRendererdTask(t);
          valid.push(t);
        }
      }

      // Serialize the account's subscribed tasks.
      valid.length > 0 && s_persistMap.set(key, JSON.stringify(valid));
    }

    // Set subscriptions React state.
    SubscriptionsController.syncAccountSubscriptionsState();

    // Send successfully imported tasks to main process.
    await window.myAPI.sendSubscriptionTask({
      action: 'subscriptions:account:import',
      data: { serialized: JSON.stringify(Array.from(s_persistMap.entries())) },
    });
  };

  return (
    <DataBackupContext
      value={{
        exportDataToBackup,
        importDataFromBackup,
      }}
    >
      {children}
    </DataBackupContext>
  );
};
