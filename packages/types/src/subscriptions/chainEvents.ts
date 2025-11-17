// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '..//misc';
import type { ChainID } from '../chains';
import type { HelpItemKey } from '../help';

export interface ChainEventSubscription {
  id: string;
  chainId: ChainID;
  pallet: string;
  eventName: string;
  enabled: boolean;
  label: string;
  eventData?: Record<string, AnyData>;
  helpKey?: HelpItemKey;
}
