// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { DeleteHandlerContextInterface } from './types';

export const defaultDeleteHandlerContext: DeleteHandlerContextInterface = {
  handleDeleteAddress: () => false,
};
