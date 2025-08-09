// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-empty-function */

import type { WcFeedbackContextInterface } from './types';

export const defaultWcFeedbackContext: WcFeedbackContextInterface = {
  message: null,
  clearFeedback: () => {},
  resolveMessage: () => {},
};
