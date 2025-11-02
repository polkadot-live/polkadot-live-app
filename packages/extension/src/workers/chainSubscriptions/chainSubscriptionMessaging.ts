// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getAllChainSubscriptions } from './chainSubscriptionManager';
import { sendChromeMessage } from '../utils';

export const setChainSubscriptionsState = async () => {
  const fetched = await getAllChainSubscriptions();
  sendChromeMessage('subscriptions', 'setChainSubscriptions', {
    ser: JSON.stringify(Array.from(fetched.entries())),
  });
};
