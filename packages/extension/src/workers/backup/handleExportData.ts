// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { version } from '../../../package.json';
import { DbController } from '../../controllers';
import type { ChainID } from '@polkadot-live/types/chains';
import type { EventCallback } from '@polkadot-live/types/reporter';
import type { ExtrinsicInfo } from '@polkadot-live/types/tx';
import type { IntervalSubscription } from '@polkadot-live/types/subscriptions';

export const getExportData = async (): Promise<string> => {
  const map = new Map<string, string>();

  const getSerEvents = async () => {
    type M = Map<string, EventCallback>;
    const fetched = (await DbController.getAllObjects('events')) as M;
    return JSON.stringify(
      Array.from(fetched.values()).filter((e) => e.category !== 'Debugging')
    );
  };
  const getSerExtrinsics = async () => {
    type M = Map<string, ExtrinsicInfo>;
    const fetched = (await DbController.getAllObjects('extrinsics')) as M;
    return JSON.stringify(Array.from(fetched.values()));
  };
  const getSerIntervals = async () => {
    type M = Map<ChainID, IntervalSubscription[]>;
    const store = 'intervalSubscriptions';
    const fetched = (await DbController.getAllObjects(store)) as M;
    return JSON.stringify(Array.from(fetched.values()).flat());
  };

  map.set('version', version);
  map.set('addresses', await DbController.getAll('accounts'));
  map.set('accountTasks', await DbController.getAll('accountSubscriptions'));
  map.set('events', await getSerEvents());
  map.set('extrinsics', await getSerExtrinsics());
  map.set('intervals', await getSerIntervals());

  return JSON.stringify(Array.from(map));
};
