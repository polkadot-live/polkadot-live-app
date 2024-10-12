// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { defaultDataBackupContext } from './default';
import { createContext, useContext } from 'react';
import { AccountsController } from '@/controller/renderer/AccountsController';
import { IntervalsController } from '@/controller/renderer/IntervalsController';
import { getAddressChainId } from '@/renderer/Utils';
import {
  getFromBackupFile,
  postToImport,
  postToOpenGov,
} from '@/renderer/utils/ImportUtils';
import { useAddresses } from '@app/contexts/main/Addresses';
import { useEvents } from '@app/contexts/main/Events';
import { useManage } from '../Manage';
import { useIntervalSubscriptions } from '../IntervalSubscriptions';
import type {
  DataBackupContextInterface,
  ImportFunc,
  RemoveFunc,
} from './types';
import type {
  AccountSource,
  LedgerLocalAddress,
  LocalAddress,
} from '@/types/accounts';
import type { EventCallback } from '@/types/reporter';
import type { IntervalSubscription } from '@/types/subscriptions';

export const DataBackupContext = createContext<DataBackupContextInterface>(
  defaultDataBackupContext
);

export const useDataBackup = () => useContext(DataBackupContext);

export const DataBackupProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { setAddresses } = useAddresses();
  const { setEvents } = useEvents();

  const { tryAddIntervalSubscription, tryUpdateDynamicIntervalTask } =
    useManage();

  const { addIntervalSubscription, updateIntervalSubscription } =
    useIntervalSubscriptions();

  /// Extract address data from an imported text file and send to application.
  const importAddressData = async (
    serialized: string,
    handleImportAddress: ImportFunc,
    handleRemoveAddress: RemoveFunc
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
          postToImport('import:account:add', {
            json: JSON.stringify(a),
            source,
          });

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

        // Update managed account names.
        const account = AccountsController.get(chainId, address);
        if (account) {
          account.name = name;
          AccountsController.update(chainId, account);
        }
      }

      // Update account list state.
      setAddresses(AccountsController.getAllFlattenedAccountData());
    }
  };

  /// Extract event data from an imported text file and send to application.
  const importEventData = async (serialized: string): Promise<void> => {
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

  /// Extract interval task data from an imported text file and send to application.
  const importIntervalData = async (serialized: string): Promise<void> => {
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

    const inserts: IntervalSubscription[] = JSON.parse(
      map.get('insert') || '[]'
    );
    const updates: IntervalSubscription[] = JSON.parse(
      map.get('update') || '[]'
    );

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
        postToOpenGov('openGov:task:add', { serialized: JSON.stringify(t) });
      });
      updates.forEach((t) => {
        postToOpenGov('openGov:task:update', { serialized: JSON.stringify(t) });
      });
    }
  };

  return (
    <DataBackupContext.Provider
      value={{ importAddressData, importEventData, importIntervalData }}
    >
      {children}
    </DataBackupContext.Provider>
  );
};
