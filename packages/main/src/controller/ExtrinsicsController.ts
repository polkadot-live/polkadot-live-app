// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ExtrinsicsRepository } from '../db';
import * as ImportUtils from '../utils/ImportUtils';
import type { IpcTask } from '@polkadot-live/types/communication';
import type {
  ExTransferKeepAliveData,
  ExtrinsicInfo,
  TxStatus,
} from '@polkadot-live/types/tx';

export class ExtrinsicsController {
  private static pendingExtrinsics: string[] = [];

  /**
   * Process an async IPC task.
   */
  static processAsync(task: IpcTask): string | undefined {
    switch (task.action) {
      case 'extrinsics:getAll': {
        return ExtrinsicsController.getAll();
      }
      case 'extrinsics:getCount': {
        return ExtrinsicsController.getCount(task);
      }
      case 'extrinsics:import': {
        return ExtrinsicsController.import(task);
      }
      case 'extrinsics:persist': {
        ExtrinsicsController.persist(task);
        return;
      }
      case 'extrinsics:remove': {
        ExtrinsicsController.remove(task);
        return;
      }
      case 'extrinsics:update': {
        ExtrinsicsController.update(task);
        return;
      }
      case 'extrinsics:addPending': {
        const { serMeta }: { serMeta: string } = task.data;
        ExtrinsicsController.pendingExtrinsics.push(serMeta);
        return;
      }
      case 'extrinsics:getPending': {
        const res = JSON.stringify(ExtrinsicsController.pendingExtrinsics);
        ExtrinsicsController.pendingExtrinsics = [];
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
    ExtrinsicsRepository.update(info.txId, info.txStatus, info.estimatedFee);
  }

  /**
   * Get all stored extrinsics in serialized form.
   */
  private static getAll(): string {
    const stored = ExtrinsicsRepository.getAll();
    return JSON.stringify(stored);
  }

  /**
   * Get count of extrinsics with optional status.
   */
  private static getCount(task: IpcTask): string {
    const { status }: { status: TxStatus } = task.data;
    const count = ExtrinsicsRepository.count(status);
    return count.toString();
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
    const stored = ExtrinsicsRepository.getAll().map((info) => {
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
      (a) => !stored.find((b) => ImportUtils.compareExtrinsics(a, b)),
    );

    ExtrinsicsRepository.replaceAll([...stored, ...append]);
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
    const stored = ExtrinsicsRepository.getAll();
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
            return !found;
          }
        }
      }
      return true;
    });

    const updated = [...filtered, info];
    ExtrinsicsRepository.replaceAll(updated);
  }

  /**
   * Remove an extrinsic from store.
   */
  private static remove(task: IpcTask) {
    const { txId } = task.data;
    ExtrinsicsRepository.delete(txId);
  }

  /**
   * Get all stored extrinsics in serialized form.
   */
  static getBackupDate(): string {
    const stored = ExtrinsicsRepository.getAll();
    return JSON.stringify(stored);
  }
}
