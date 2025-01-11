// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ActionMeta } from './tx';
import type { AnyJson } from './misc';
import type { EventAccountData, EventChainData } from './reporter';
import type { TaskAction } from './subscriptions';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace V05Alpha {
  export interface EventAction {
    uri: string;
    text?: string;
    txMeta?: ActionMeta;
  }

  export interface EventCallback {
    uid: string;
    category: string;
    taskAction: TaskAction | string;
    who: {
      origin: 'account' | 'chain' | 'interval';
      data: EventAccountData | EventChainData;
    };
    title: string;
    subtitle: string;
    data: AnyJson;
    timestamp: number;
    actions: EventAction[]; // Changed in later versions.
    stale: boolean;
  }
}
