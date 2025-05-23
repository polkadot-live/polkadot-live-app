// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { CogMenuContextInterface } from './types';

export const defaultCogMenuContext: CogMenuContextInterface = {
  getAppFlags: () => ({
    isConnecting: false,
    isOnline: false,
    isAborting: false,
    isLoading: false,
  }),
  getConnectionButtonText: () => '',
  getMenuItems: () => [],
  handleAbortConnecting: () => {},
  handleConnectClick: () => new Promise(() => {}),
  handleSilenceNotifications: () => {},
};
