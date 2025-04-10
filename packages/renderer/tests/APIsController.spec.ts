// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { describe, expect, it, vi } from 'vitest';
import { APIsController } from '@ren/controller/dedot/APIsController';
import { ChainList } from '@ren/config/chains';
import type { Api } from '@ren/model/dedot/Api';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ClientTypes } from '@polkadot-live/types/apis';

describe('APIsController', () => {
  it('Should initialize all clients in a disconnected state', () => {
    const mockSetUiTrigger = vi.fn();
    const mockCachedSetChains = vi.fn();
    APIsController.setUiTrigger = mockSetUiTrigger;
    APIsController.cachedSetChains = mockCachedSetChains;

    const chainIds = Array.from(ChainList.keys());
    APIsController.initialize(chainIds);

    // Check total number of initialized clients.
    const numChains = chainIds.length;
    const numClients = APIsController.clients.length;
    expect(numClients).toBe(numChains);

    // Check each client is disconnected.
    const mapFn = (c: Api<keyof ClientTypes>) => c.status() === 'disconnected';
    const allDisconnected = APIsController.clients.map(mapFn);
    expect(allDisconnected).toEqual([true, true, true]);

    // Check every chain has an API client.
    const sortFn = (a: ChainID, b: ChainID) => a.localeCompare(b);
    const clientIds = APIsController.clients.map((c) => c.chain).sort(sortFn);
    expect(clientIds).toEqual(chainIds.sort(sortFn));
  });
});
