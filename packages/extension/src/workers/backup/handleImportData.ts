// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { sendChromeMessage } from '../utils';
import { importAccountTaskData, updateTaskEntries } from './accountTaskImport';
import { importAddressData } from './addressImport';
import { importEventData } from './eventImport';
import { importExtrinsicsData } from './extrinsicImport';
import { importIntervalData } from './intervalImport';

export const handleImportData = async (contents: string, isOnline: boolean) => {
  try {
    await importAddressData(contents, isOnline);
    updateTaskEntries();
    await importAccountTaskData(contents);
    await importEventData(contents);
    await importIntervalData(contents, isOnline);
    await importExtrinsicsData(contents);
  } catch (err) {
    console.error(err);
    sendChromeMessage('sharedState', 'relay', {
      key: 'backup:importing',
      value: false,
    });
  }
};
