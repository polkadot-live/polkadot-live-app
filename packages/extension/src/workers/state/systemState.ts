// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

let SYSTEMS_INITIALIZED = false;

export const isSystemsInitialized = (): boolean => SYSTEMS_INITIALIZED;
export const setSystemsInitialized = (value: boolean): void => {
  SYSTEMS_INITIALIZED = value;
};
