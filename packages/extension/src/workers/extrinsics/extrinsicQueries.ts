// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../../controllers';
import type { ExtrinsicInfo } from '@polkadot-live/types/tx';

export const getAllExtrinsics = async () => {
  const all = (await DbController.getAllObjects('extrinsics')) as Map<
    string,
    ExtrinsicInfo
  >;
  return Array.from(all.values()).map((e) => e);
};
