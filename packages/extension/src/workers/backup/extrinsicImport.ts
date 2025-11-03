// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../../controllers';
import { getFromBackupFile } from '@polkadot-live/core';
import { handlePersistExtrinsic } from '../extrinsics';
import { sendChromeMessage } from '../utils';
import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type {
  ExTransferKeepAliveData,
  ExtrinsicInfo,
  TxActionUid,
} from '@polkadot-live/types/tx';

export const importExtrinsicsData = async (contents: string) => {
  const serExtrinsics = getFromBackupFile('extrinsics', contents);
  if (!serExtrinsics) {
    return;
  }
  const parsed: ExtrinsicInfo[] = JSON.parse(serExtrinsics);
  type M = Map<string, ExtrinsicInfo>;
  const fetched = (await DbController.getAllObjects('extrinsics')) as M;
  const addressNameMap = await getAddressMap();

  // Sync account names with import data.
  for (const [txId, info] of fetched.entries()) {
    const { action, accountName, chainId, from } = info.actionMeta;
    let persist = false;

    // Update transfer extrinsic data if necessary.
    if (action === 'balances_transferKeepAlive') {
      type T = ExTransferKeepAliveData;
      const { recipientAccountName, recipientAddress }: T =
        info.actionMeta.data;

      const cur = addressNameMap.get(`${chainId}:${recipientAddress}`);
      if (cur && cur !== recipientAccountName) {
        info.actionMeta.data.recipientAccountName = cur;
        persist = true;
      }
    }
    // Update signer account name if necessary.
    const cur = addressNameMap.get(`${chainId}:${from}`);
    if (cur && cur !== accountName) {
      info.actionMeta.accountName = cur;
      persist = true;
    }
    // Update fetched extrinsics map and database.
    fetched.set(txId, info);
    persist && (await DbController.set('extrinsics', txId, info));
  }

  // Persist unique extrinsics to store.
  const append = parsed.filter(
    (a) => !Array.from(fetched.values()).find((b) => compareExtrinsics(a, b))
  );
  for (const info of append) {
    await handlePersistExtrinsic(info);
  }
  // Update extrinsics state.
  sendChromeMessage('extrinsics', 'import:setExtrinsics', {
    ser: await DbController.getAll('extrinsics'),
  });
};

// NOTE: Requires that addresses are already persisted in the database in a previous import step.
const getAddressMap = async (): Promise<Map<string, string>> => {
  type M = Map<AccountSource, ImportedGenericAccount[]>;
  const store = 'accounts';
  const fetched = (await DbController.getAllObjects(store)) as M;
  const map = new Map<string, string>();

  for (const generics of fetched.values()) {
    for (const generic of generics) {
      for (const encoded of Object.values(generic.encodedAccounts)) {
        const { address, chainId, alias } = encoded;
        map.set(`${chainId}:${address}`, alias);
      }
    }
  }
  return map;
};

// NOTE: Move to core.
const compareExtrinsics = (a: ExtrinsicInfo, b: ExtrinsicInfo) => {
  const { action: aAction, from: aFrom } = a.actionMeta;
  const { action: bAction, from: bFrom } = b.actionMeta;
  const whiteListed: TxActionUid = 'balances_transferKeepAlive';

  return a.txId === b.txId
    ? true
    : aFrom === bFrom &&
        aAction === bAction &&
        aAction !== whiteListed &&
        a.txStatus !== 'finalized'
      ? true
      : false;
};
