// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { APIsController } from '@ren/controller/dedot/APIsController';
import { ChainList } from '@ren/config/chains';
import type { Api } from '@ren/model/dedot/Api';
import type { ChainID } from '@polkadot-live/types/chains';
import type { ClientTypes } from '@polkadot-live/types/apis';

describe('APIsController', () => {
  describe('Initialization', () => {
    it('Should initialize all clients in a disconnected state', () => {
      APIsController.setUiTrigger = vi.fn();
      APIsController.cachedSetChains = vi.fn();

      const chainIds = Array.from(ChainList.keys());
      APIsController.initialize(chainIds);

      // Check total number of initialized clients.
      const numChains = chainIds.length;
      const numClients = APIsController.clients.length;
      expect(numClients).toBe(numChains);

      // Check each client is disconnected.
      const mapFn = (c: Api<keyof ClientTypes>) =>
        c.status() === 'disconnected';
      const allDisconnected = APIsController.clients.map(mapFn);
      expect(allDisconnected).toEqual([true, true, true]);

      // Check every chain has an API client.
      const sortFn = (a: ChainID, b: ChainID) => a.localeCompare(b);
      const clientIds = APIsController.clients.map((c) => c.chain).sort(sortFn);
      expect(clientIds).toEqual(chainIds.sort(sortFn));
    });
  });

  describe('Async Processes', () => {
    beforeEach(() => {
      APIsController.setUiTrigger = vi.fn();
      APIsController.cachedSetChains = vi.fn();
      APIsController.initialize(Array.from(ChainList.keys()));
    });

    afterEach(async () => {
      await APIsController.closeAll();
    });

    it('Should successfully connect a client', async () => {
      const chainId: ChainID = 'Polkadot';
      await APIsController.connectApi(chainId);
      const client = APIsController.clients.find((c) => c.chain === chainId)!;

      expect(client.status()).toBe('connected');
      expect(client.chain).toEqual(chainId);
      expect(client.api).not.toBeNull();
    });

    it('Should close a connected client', async () => {
      const chainId: ChainID = 'Polkadot';
      await APIsController.connectApi(chainId);
      await APIsController.close(chainId);

      const client = APIsController.clients.find((c) => c.chain === chainId)!;
      expect(client.status()).toBe('disconnected');
      expect(client.api).toBeNull();
    });

    it('Should close all connected clients', async () => {
      // Connect clients and verify connected status.
      const chainIds: ChainID[] = ['Polkadot', 'Kusama'];
      await Promise.all(chainIds.map((c) => APIsController.connectApi(c)));
      for (const chainId of chainIds) {
        const client = APIsController.clients.find((c) => c.chain === chainId)!;
        expect(client.status()).toBe('connected');
      }

      // Close all clients and verify status.
      await APIsController.closeAll();
      for (const chainId of chainIds) {
        const client = APIsController.clients.find((c) => c.chain === chainId)!;
        expect(client.status()).toBe('disconnected');
        expect(client.api).toBeNull();
      }
    });

    it('Should provide a connected client', async () => {
      const chainId: ChainID = 'Polkadot';
      const client = await APIsController.getConnectedApi(chainId);

      expect(client).not.toBeNull();
      expect(client?.status()).toBe('connected');
    });

    it('Should provide the status of managed clients', async () => {
      const connectedId: ChainID = 'Polkadot';
      const disconnectedId: ChainID = 'Kusama';
      await APIsController.connectApi(connectedId);

      expect(APIsController.getStatus(connectedId)).toBe('connected');
      expect(APIsController.getStatus(disconnectedId)).toBe('disconnected');
    });

    it('Should connect to a new endpoint', async () => {
      const chainId: ChainID = 'Polkadot';
      const endpoint1 = ChainList.get(chainId)!.endpoints.rpcs[0];
      const endpoint2 = ChainList.get(chainId)!.endpoints.rpcs[1];

      // Connect to the default endpoint.
      await APIsController.connectApi(chainId);
      const client = await APIsController.getConnectedApi(chainId);
      expect(client?.endpoint).toBe(endpoint1);
      expect(client?.status()).toBe('connected');

      // Connect to another endpoint.
      await APIsController.connectEndpoint(chainId, endpoint2);
      expect(client?.endpoint).toBe(endpoint2);
      expect(client?.status()).toBe('connected');
    });
  });
});
