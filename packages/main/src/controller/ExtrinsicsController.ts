// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as ImportUtils from '../utils/ImportUtils';
import { store } from '../main';
import type { AnyJson } from '@polkadot-live/types/misc';
import type {
  ExTransferKeepAliveData,
  ExtrinsicInfo,
  TxStatus,
} from '@polkadot-live/types/tx';
import type { IpcTask } from '@polkadot-live/types/communication';

export class ExtrinsicsController {
  private static storeKey = 'persisted_extrinsics';
  private static pendingExtrinsics: string[] = [];

  /**
   * Process an async IPC task.
   */
  static processAsync(task: IpcTask): string | void {
    switch (task.action) {
      case 'extrinsics:getAll': {
        return this.getAll();
      }
      case 'extrinsics:getCount': {
        return this.getCount(task);
      }
      case 'extrinsics:import': {
        return this.import(task);
      }
      case 'extrinsics:persist': {
        this.persist(task);
        return;
      }
      case 'extrinsics:remove': {
        this.remove(task);
        return;
      }
      case 'extrinsics:update': {
        this.update(task);
        return;
      }
      case 'extrinsics:addPending': {
        const { serMeta }: { serMeta: string } = task.data;
        this.pendingExtrinsics.push(serMeta);
        return;
      }
      case 'extrinsics:getPending': {
        const res = JSON.stringify(this.pendingExtrinsics);
        this.pendingExtrinsics = [];
        return res;
      }
      default: {
        return;
      }
    }
  }

  /**
   * Update an extrinsic in the store.
   */
  private static update(task: IpcTask) {
    const { serialized }: { serialized: string } = task.data;
    const info: ExtrinsicInfo = JSON.parse(serialized);
    info.dynamicInfo = undefined;
    const stored = this.getExtrinsicsFromStore();
    const updated = stored.map((i) => (i.txId === info.txId ? { ...info } : i));
    this.persistExtrinsicsToStore(updated);
  }

  /**
   * Get all stored extrinsics in serialized form.
   */
  private static getAll(): string {
    return (store as Record<string, AnyJson>).get(this.storeKey) as string;
  }

  /**
   * Get count of extrinsics with optional status.
   */
  private static getCount(task: IpcTask): string {
    const { status }: { status: TxStatus } = task.data;
    const stored = this.getExtrinsicsFromStore();

    return !status
      ? stored.length.toString()
      : stored.filter(({ txStatus }) => status === txStatus).length.toString();
  }

  /**
   * @name import
   * @summary Persist new extrinsics received from backup file.
   * @returns Up-to-date serialized extrinsics after import.
   */
  private static import(task: IpcTask) {
    const { serialized }: { serialized: string } = task.data;
    const received: ExtrinsicInfo[] = JSON.parse(serialized);
    const addressNameMap = ImportUtils.getAddressNameMap();

    // Get stored extrinsics and sync account names with import data.
    const stored = this.getExtrinsicsFromStore().map((info) => {
      const { action, accountName, chainId, from } = info.actionMeta;

      // Update transfer extrinsic data if necessary.
      if (action === 'balances_transferKeepAlive') {
        const {
          recipientAccountName,
          recipientAddress,
        }: ExTransferKeepAliveData = info.actionMeta.data;

        const cur = addressNameMap.get(`${chainId}:${recipientAddress}`);
        if (cur && cur !== recipientAccountName) {
          info.actionMeta.data.recipientAccountName = cur;
        }
      }
      // Update sender account name if necessary.
      const cur = addressNameMap.get(`${chainId}:${from}`);
      if (cur && cur !== accountName) {
        info.actionMeta.accountName = cur;
      }
      return info;
    });

    // Append unique imported extrinsics.
    const append: ExtrinsicInfo[] = received.filter(
      (a) => !stored.find((b) => ImportUtils.compareExtrinsics(a, b))
    );

    this.persistExtrinsicsToStore([...stored, ...append]);
    return JSON.stringify([...stored, ...append]);
  }

  /**
   * Persist a received extrinsic to store.
   */
  private static persist(task: IpcTask) {
    const { serialized }: { serialized: string } = task.data;
    const info: ExtrinsicInfo = JSON.parse(serialized);
    const { action, from } = info.actionMeta;

    // Remove dynamic info.
    info.dynamicInfo = undefined;

    // Get stored extrinsics and remove any duplicate extrinsics.
    const stored = this.getExtrinsicsFromStore();
    const filtered = stored.filter((i) => {
      if (action === i.actionMeta.action) {
        switch (action) {
          case 'balances_transferKeepAlive': {
            // Allow duplicate transfer extrinsics.
            return true;
          }
          case 'nominationPools_pendingRewards_bond':
          case 'nominationPools_pendingRewards_withdraw': {
            // Duplicate if signer and rewards are the same.
            const { extra }: { extra: string } = info.actionMeta.data;
            const found =
              from === i.actionMeta.from &&
              extra === i.actionMeta.data.extra &&
              i.txStatus === 'pending';
            return found ? false : true;
          }
        }
      } else {
        return true;
      }
    });

    const updated = [...filtered, info];
    this.persistExtrinsicsToStore(updated);
  }

  /**
   * Remove an extrinsic from store.
   */
  private static remove(task: IpcTask) {
    const { txId } = task.data;
    const stored = this.getExtrinsicsFromStore();
    const updated = stored.filter((info) => info.txId !== txId);
    this.persistExtrinsicsToStore(updated);
  }

  /**
   * Utility to get and parse extrinsics from store.
   */
  private static getExtrinsicsFromStore = (): ExtrinsicInfo[] => {
    const stored = (store as Record<string, AnyJson>).get(
      this.storeKey
    ) as string;

    return !stored ? [] : JSON.parse(stored);
  };

  /**
   * Utility to persist an extrinsics array to store.
   */
  private static persistExtrinsicsToStore = (extrinsics: ExtrinsicInfo[]) => {
    (store as Record<string, AnyJson>).set(
      this.storeKey,
      JSON.stringify(extrinsics)
    );
  };

  /**
   * Get all stored extrinsics in serialized form.
   */
  static getBackupDate(): string {
    return (store as Record<string, AnyJson>).get(this.storeKey) as string;
  }
}
