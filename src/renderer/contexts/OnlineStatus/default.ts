// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { OnlineStatusInterface } from './types';

export const defaultOnlineStatusContext: OnlineStatusInterface = {
  online: false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  setOnline: (b) => {},
};
