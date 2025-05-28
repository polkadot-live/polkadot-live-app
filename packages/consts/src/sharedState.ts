// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SyncID } from '@polkadot-live/types';

export const initSharedState = () =>
  new Map<SyncID, boolean>([
    ['account:importing', false],
    ['backup:exporting', false],
    ['backup:importing', false],
    ['extrinsic:building', false],
    ['mode:connected', false],
    ['mode:online', false],
    ['wc:account:approved', false],
    ['wc:account:verifying', false],
    ['wc:connecting', false],
    ['wc:disconnecting', false],
    ['wc:initialized', false],
    ['wc:session:restored', false],
  ]);
