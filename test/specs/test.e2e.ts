// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import assert from 'node:assert';
import { expect } from 'expect-webdriverio';
import type { Rectangle } from 'electron';

describe('when the app starts', function () {
  it('should return the correct application name', async function () {
    const appName = await browser.electron.app('getName');
    assert.strictEqual(appName, 'polkadot-live');
  });
});

describe('when the main window is opened', () => {
  it('should be sized correctly', async function () {
    await browser.electron.api('toggleMainWindow');
    const boundsResult = await browser.electron.browserWindow('getBounds');
    const bounds = boundsResult as Rectangle;

    expect(bounds.width).toBeGreaterThanOrEqual(420);
    expect(bounds.width).toBeLessThanOrEqual(420);

    expect(bounds.height).toBeGreaterThanOrEqual(475);
    expect(bounds.height).toBeLessThanOrEqual(1200);
  });

  it('should have the events tab active by default', async function () {
    const activeTab = await browser.$$('.active');
    const span = activeTab[0];
    expect(span).toHaveText('Events');
  });
});

describe('when the manage tab is clicked', function () {
  it('should make the manage tab active', async function () {
    const spans = await browser.$$('span');

    const index = await spans.findIndex(async (currentValue) => {
      const text = await currentValue.getText();
      return text === 'Manage' ? true : false;
    });

    const manageTab = spans[index];

    if (!manageTab) {
      throw Error('Error: Manage tab not found');
    }

    await manageTab.click();
    await browser.pause(100);
    expect(manageTab).toHaveElementClass('active');
  });
});
