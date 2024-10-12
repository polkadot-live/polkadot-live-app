// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export type ImportFunc = (
  ev: MessageEvent,
  fromBackup: boolean
) => Promise<void>;

export type RemoveFunc = (ev: MessageEvent) => Promise<void>;

export interface DataBackupContextInterface {
  importAddressData: (
    serialized: string,
    handleImportAddress: ImportFunc,
    handleRemoveAddress: RemoveFunc
  ) => Promise<void>;
  importEventData: (serialized: string) => Promise<void>;
}
