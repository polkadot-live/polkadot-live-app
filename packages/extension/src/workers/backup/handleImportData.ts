// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { importAccountTaskData, updateTaskEntries } from './accountTaskImport';
import { importAddressData } from './addressImport';
import { importEventData } from './eventImport';
import { importExtrinsicsData } from './extrinsicImport';
import { importIntervalData } from './intervalImport';
import { sendChromeMessage } from '../utils';
import type { Account } from '@polkadot-live/core';
import type { ChainID } from '@polkadot-live/types/chains';
import type {
  EncodedAccount,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';
import type { SubscriptionTask } from '@polkadot-live/types/subscriptions';

export const handleImportData = async (
  contents: string,
  isOnline: boolean,
  // TMP: Provide function pointers until refactor.
  handleImportAddress: (
    generic: ImportedGenericAccount,
    encoded: EncodedAccount,
    onlineMode: boolean,
    fromBackup: boolean
  ) => Promise<void>,
  handleRemoveAddress: (address: string, chainId: ChainID) => Promise<void>,
  updateAccountSubscription: (
    account: Account,
    task: SubscriptionTask
  ) => Promise<void>,
  setAccountSubscriptionsState: () => Promise<void>,
  subscribeAccountTask: (task: SubscriptionTask) => Promise<void>
) => {
  try {
    await importAddressData(
      contents,
      isOnline,
      handleImportAddress,
      handleRemoveAddress
    );
    updateTaskEntries();
    await importAccountTaskData(
      contents,
      updateAccountSubscription,
      setAccountSubscriptionsState,
      subscribeAccountTask
    );
    await importEventData(contents);
    await importIntervalData(contents, isOnline);
    await importExtrinsicsData(contents);
  } catch (err) {
    console.error(err);
    sendChromeMessage('sharedState', 'relay', {
      key: 'backup:importing',
      value: false,
    });
  }
};
