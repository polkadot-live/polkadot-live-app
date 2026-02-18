// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getExportData, handleImportData } from '../../backup';
import type { AnyData } from '@polkadot-live/types/misc';

export const handleDataBackupMessage = (
  message: AnyData,
  sendResponse: (response?: AnyData) => void,
): boolean => {
  switch (message.task) {
    case 'exportData': {
      getExportData().then((result) => sendResponse(result));
      return true;
    }
    case 'importData': {
      const { contents, isOnline }: { contents: string; isOnline: boolean } =
        message.payload;
      handleImportData(contents, isOnline).then(() => {
        sendResponse(true);
      });
      return true;
    }
    default: {
      console.warn(`Unknown data backup task: ${message.task}`);
      return false;
    }
  }
};
