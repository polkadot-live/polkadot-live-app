import { browser } from '@wdio/globals';
import assert from 'node:assert';

describe('Electron Testing', () => {
  it('should return the correct application name', async () => {
    const appName = await browser.electron.app('getName');
    assert.strictEqual(appName, 'Polkadot Live');
  });
});
