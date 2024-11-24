// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { describe, expect, it, vi } from 'vitest';
import { API, KEY_CONFIG } from '../src/preload';
import { contextBridge } from 'electron';

vi.mock('electron', () => ({
  contextBridge: {
    exposeInMainWorld: vi.fn(),
  },
  ipcRenderer: {
    on: vi.fn(),
  },
}));

describe('Preload API', () => {
  it('should all be exposed', () => {
    const { exposeInMainWorld } = vi.mocked(contextBridge);
    expect(exposeInMainWorld).toHaveBeenCalledWith(KEY_CONFIG.apiKey, API);
    expect(exposeInMainWorld).toHaveBeenCalledTimes(1);
  });
});
