// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../../controllers';
import { ExtrinsicsController } from '@polkadot-live/core';
import type { ExtrinsicInfo } from '@polkadot-live/types/tx';

export const handlePersistExtrinsic = async (info: ExtrinsicInfo) => {
  await DbController.set('extrinsics', info.txId, info);
};

export const updateExtrinsic = async (info: ExtrinsicInfo) => {
  const { txId } = info;
  await DbController.set('extrinsics', txId, info);
};

export const removeExtrinsic = async (txId: string) => {
  ExtrinsicsController.deleteTx(txId);
  await DbController.delete('extrinsics', txId);
};
