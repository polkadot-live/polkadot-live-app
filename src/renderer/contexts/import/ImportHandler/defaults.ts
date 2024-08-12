// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { ImportHandlerContextInterface } from './types';

export const defaultImportHandlerContext: ImportHandlerContextInterface = {
  handleImportAddress: () => new Promise(() => {}),
  handleImportAddressFromBackup: () => new Promise(() => {}),
};
