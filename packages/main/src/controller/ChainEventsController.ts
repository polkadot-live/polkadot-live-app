// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ChainEventsRepository } from '../db';
import type {
  ChainEventSubscription,
  FlattenedAccountData,
  IpcTask,
} from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';

export class ChainEventsController {
  /**
   * Process a chain event subscription task.
   */
  static process(task: IpcTask): string | undefined {
    switch (task.action) {
      case 'chainEvents:getAll': {
        return ChainEventsController.getAll();
      }
      case 'chainEvents:getAllForAccount': {
        const { account } = task.data;
        return ChainEventsController.getAllForAccount(account) ?? '[]';
      }
      case 'chainEvents:insert': {
        const data = task.data;
        ChainEventsController.put(data.subscription);
        break;
      }
      case 'chainEvents:insertForAccount': {
        const { account, subscription } = task.data;
        ChainEventsController.putForAccount(account, subscription);
        break;
      }
      case 'chainEvents:insertRefSubs': {
        const { chainId, refId, serialized } = task.data;
        ChainEventsController.putSubsForRef(chainId, refId, serialized);
        break;
      }
      case 'chainEvents:getActiveRefIds': {
        return JSON.stringify(ChainEventsController.getActiveRefIds());
      }
      case 'chainEvents:getAllRefSubs': {
        return ChainEventsController.getAllRefSubs();
      }
      case 'chainEvents:getAllRefSubsForChain': {
        const { chainId } = task.data;
        return JSON.stringify(
          ChainEventsController.getAllRefSubsForChain(chainId),
        );
      }
      case 'chainEvents:removeRefSubs': {
        const { chainId, refId, serialized } = task.data;
        ChainEventsController.removeSubsForRef(chainId, refId, serialized);
        break;
      }
      case 'chainEvents:removeForAccount': {
        const { account, subscription } = task.data;
        ChainEventsController.removeForAccount(account, subscription);
        break;
      }
      case 'chainEvents:removeAllForAccount': {
        const { account } = task.data;
        ChainEventsController.removeAllForAccount(account);
        break;
      }
      case 'chainEvents:remove': {
        const { chainId, subscription } = task.data;
        ChainEventsController.remove(chainId, subscription);
        break;
      }
      case 'chainEvents:getActiveCount': {
        return ChainEventsController.getActiveCount().toString();
      }
    }
  }

  private static getActiveRefIds = (): string[] => {
    return ChainEventsRepository.getActiveRefs();
  };

  private static getAllRefSubs = (): string => {
    // Get active ref ids.
    const idsCur: string[] = ChainEventsRepository.getActiveRefs();
    const idsObj = idsCur.map((k) => {
      const s = k.split('::');
      return { chainId: s[0] as ChainID, refId: parseInt(s[1], 10) };
    });

    // Construct record chainId -> refId -> subscriptions.
    const chainIds = new Set(idsObj.map(({ chainId }) => chainId));
    const recResult: Record<
      string,
      Record<number, ChainEventSubscription[]>
    > = {};

    for (const cid of chainIds) {
      const refIds = idsObj
        .filter(({ chainId }) => chainId === cid)
        .map(({ refId }) => refId);

      const recRefs: Record<number, ChainEventSubscription[]> = {};
      for (const refId of refIds) {
        recRefs[refId] = ChainEventsRepository.getAllForRef(cid, refId);
      }
      recResult[cid] = recRefs;
    }
    return JSON.stringify(recResult);
  };

  private static getAllRefSubsForChain = (
    chainId: ChainID,
  ): ChainEventSubscription[] => {
    const cur: string[] = ChainEventsRepository.getActiveRefs();

    const refIds = cur
      .map((id) => {
        const s = id.split('::');
        return { cid: s[0] as ChainID, rid: parseInt(s[1], 10) };
      })
      .filter(({ cid }) => cid === chainId)
      .map(({ rid }) => rid);

    let subs: ChainEventSubscription[] = [];
    for (const refId of refIds) {
      subs = subs.concat(ChainEventsRepository.getAllForRef(chainId, refId));
    }
    return subs;
  };

  private static putSubsForRef = (
    chainId: ChainID,
    refId: number,
    serialized: string,
  ) => {
    ChainEventsController.putActiveRefId(chainId, refId);
    const parsed: ChainEventSubscription[] = JSON.parse(serialized);
    if (!parsed.length) {
      return;
    }
    const cmp = ChainEventsController.cmp;
    const stored = ChainEventsRepository.getAllForRef(chainId, refId);
    const updated = stored
      .filter((a) => !parsed.find((b) => cmp(a, b)))
      .concat(parsed);
    ChainEventsController.updateRepoForRef(chainId, refId, updated);
  };

  private static removeSubsForRef = (
    chainId: ChainID,
    refId: number,
    serialized: string,
  ) => {
    const parsed: ChainEventSubscription[] = JSON.parse(serialized);
    if (!parsed.length) {
      return;
    }
    const cmp = ChainEventsController.cmp;
    const stored = ChainEventsRepository.getAllForRef(chainId, refId);
    const updated = stored.filter((a) => !parsed.find((b) => cmp(a, b)));
    ChainEventsController.updateRepoForRef(chainId, refId, updated);
  };

  // Functions to control cached ref ids.
  private static putActiveRefId = (chainId: ChainID, refId: number) => {
    ChainEventsRepository.addActiveRef(chainId, refId);
  };

  static removeActiveRefId = (chainId: ChainID, refId: number) => {
    ChainEventsRepository.removeActiveRef(chainId, refId);
  };

  // Persist chain events subscriptions for a ref.
  private static updateRepoForRef = (
    chainId: ChainID,
    refId: number,
    subs: ChainEventSubscription[],
  ) => {
    // Delete all existing subscriptions for this ref, then insert the updated ones.
    ChainEventsRepository.removeAllForRef(chainId, refId);
    for (const sub of subs) {
      ChainEventsRepository.insert(sub, 'ref', refId.toString());
    }
  };

  private static getActiveCount = (): number => {
    const map = ChainEventsRepository.getAllGlobal();
    return map.values().reduce((acc, subs) => (acc += subs.length), 0);
  };

  /**
   * Utility to compare chain event subscriptions.
   */
  private static cmp = (a: ChainEventSubscription, b: ChainEventSubscription) =>
    a.pallet === b.pallet && a.eventName === b.eventName;

  /**
   * Get all chain event subscriptions from database.
   */
  private static getAll(): string | undefined {
    const globalSubs = ChainEventsRepository.getAllGlobalSerialized();
    return globalSubs !== '[]' ? globalSubs : undefined;
  }

  /**
   * Get all account-scoped chain event subscriptions from database.
   */
  private static getAllForAccount(
    account: FlattenedAccountData,
  ): string | undefined {
    const { address, chain: chainId } = account;
    const subs = ChainEventsRepository.getAllForAccount(chainId, address);
    return subs.length > 0 ? JSON.stringify(subs) : undefined;
  }

  /**
   * Insert or update a chain event subscription in the database.
   */
  private static put(sub: ChainEventSubscription) {
    ChainEventsRepository.removeGlobal(sub.chainId, sub.pallet, sub.eventName);
    ChainEventsRepository.insert(sub, 'global', null);
  }

  /**
   * Insert or update an account-scoped chain event subscription in the database.
   */
  private static putForAccount(
    account: FlattenedAccountData,
    sub: ChainEventSubscription,
  ) {
    ChainEventsRepository.removeForAccount(
      account.chain,
      account.address,
      sub.pallet,
      sub.eventName,
    );
    ChainEventsRepository.insert(sub, 'account', account.address);
  }

  /**
   * Remove a chain event subscription from the database.
   */
  private static remove(chainId: ChainID, sub: ChainEventSubscription) {
    ChainEventsRepository.removeGlobal(chainId, sub.pallet, sub.eventName);
  }

  /**
   * Remove an account-scoped chain event subscription from the database.
   */
  private static removeForAccount(
    account: FlattenedAccountData,
    sub: ChainEventSubscription,
  ) {
    ChainEventsRepository.removeForAccount(
      account.chain,
      account.address,
      sub.pallet,
      sub.eventName,
    );
  }

  /**
   * Remove account-scoped chain event subscriptions from the database.
   */
  private static removeAllForAccount(account: FlattenedAccountData) {
    const { address, chain: chainId } = account;
    ChainEventsRepository.removeAllForAccount(chainId, address);
  }
}
