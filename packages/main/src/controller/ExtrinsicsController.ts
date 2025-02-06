// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { store } from '@/main';
import type { AnyJson } from '@polkadot-live/types/misc';
import type { ExtrinsicInfo } from '@polkadot-live/types/tx';
import type { IpcTask } from '@polkadot-live/types/communication';

export class ExtrinsicsController {
  private static storeKey = 'persisted_extrinsics';

  /**
   * Process an async IPC task.
   */
  static processAsync(task: IpcTask): string | void {
    switch (task.action) {
      case 'extrinsics:getAll': {
        return this.getAll();
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
      if (
        i.actionMeta.from === from &&
        i.actionMeta.action === action &&
        // Allow duplicate balance extrinsics.
        action !== 'balances_transferKeepAlive'
      ) {
        return i.txStatus !== info.txStatus ? true : false;
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
}
