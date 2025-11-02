// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SyncID } from '@polkadot-live/types/communication';

const SHARED_STATE = new Map<SyncID, boolean>();

export const getSharedState = (): Map<SyncID, boolean> => SHARED_STATE;
export const setSharedState = (syncId: SyncID, value: boolean): void => {
  SHARED_STATE.set(syncId, value);
};

export const resetSharedState = (): void => {
  SHARED_STATE.clear();
};
