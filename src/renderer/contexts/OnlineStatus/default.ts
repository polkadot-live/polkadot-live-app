// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { OnlineStatusInterface } from './types';

export const defaultOnlineStatusContext: OnlineStatusInterface = {
  appLoading: true,
  online: false,
  setAppLoading(b) {},
  setOnline: (b) => {},
  handleInitializeApp: () => new Promise(() => {}),
  handleInitializeAppOffline: () => new Promise(() => {}),
  handleInitializeAppOnline: () => new Promise(() => {}),
};
