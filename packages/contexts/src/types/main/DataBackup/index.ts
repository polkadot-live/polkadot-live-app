// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';

export type ImportFunc = (
  ev: MessageEvent,
  fromBackup: boolean,
) => Promise<void>;

export type RemoveFunc = (ev: MessageEvent) => Promise<void>;

export type IntervalFunc = (t: IntervalSubscription) => void;

export interface DataBackupContextInterface {
  exportDataToBackup: () => Promise<void>;
  importDataFromBackup: (
    handleImportAddress: ImportFunc,
    handleRemoveAddress: RemoveFunc,
  ) => Promise<void>;
}
