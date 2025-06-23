// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { AccountStatusesContextInterface } from './types';

export const defaultAccountStatusesContext: AccountStatusesContextInterface = {
  anyProcessing: () => false,
  setStatusForAccount: () => {},
  getStatusForAccount: () => null,
  insertAccountStatus: () => {},
  deleteAccountStatus: () => {},
};
