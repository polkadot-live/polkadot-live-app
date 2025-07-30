// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-empty-function */

import type { WcVerifierContextInterface } from './types';

export const defaultWcVerifierContext: WcVerifierContextInterface = {
  wcAccountApproved: false,
  wcAccountVerifying: false,
  checkVerifiedSession: () => {},
  initVerifiedSession: () => {},
  resetVerification: () => {},
  setWcAccountApproved: () => {},
  setWcAccountVerifying: () => {},
};
