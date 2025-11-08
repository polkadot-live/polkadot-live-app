// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ActionMeta } from '@polkadot-live/types/tx';

let PENDING_ACTION_METADATA: ActionMeta | null = null;

export const getPendingActionMeta = (): ActionMeta | null =>
  PENDING_ACTION_METADATA;

export const setPendingActionMeta = (meta: ActionMeta | null): void => {
  PENDING_ACTION_METADATA = meta;
};
