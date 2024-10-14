// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigMain } from '@/config/processes/main';
import { dialog } from 'electron';
import { promises as fsPromises } from 'fs';
import { AddressesController } from '@/controller/main/AddressesController';
import { WindowsController } from './WindowsController';
import { EventsController } from '@/controller/main/EventsController';
import { IntervalsController } from '@/controller/main/IntervalsController';
import { SubscriptionsController } from './SubscriptionsController';
import { version } from '../../../package.json';
import type { ExportResult, ImportResult } from '@/types/backup';

export class BackupController {
  /**
   * @name export
   * @summary Export Polkadot Live data to a text file.
   */
  static async export(): Promise<ExportResult> {
    // Exit early if overlay is created.
    if (WindowsController.overlayExists()) {
      return { result: false, msg: 'alreadyOpen' };
    }

    // Return early if export dialog is already open.
    if (ConfigMain.exportingData) {
      return { result: false, msg: 'executing' };
    }

    // Render transparent browser window over base window.
    ConfigMain.exportingData = true;
    const overlay = WindowsController.getOverlay();
    if (!overlay) {
      return { result: false, msg: 'error' };
    }

    const { canceled, filePath } = await dialog.showSaveDialog(overlay, {
      title: 'Export Data',
      defaultPath: 'polkadot-live-data.txt',
      filters: [
        {
          name: 'Text Files',
          extensions: ['txt'],
        },
      ],
      properties: [],
    });

    // Handle save or cancel.
    WindowsController.destroyOverlay();
    if (!canceled && filePath) {
      try {
        const serialized = this.getExportData();
        await fsPromises.writeFile(filePath, serialized, {
          encoding: 'utf8',
        });

        ConfigMain.exportingData = false;
        return { result: true, msg: 'success' };
      } catch (err) {
        ConfigMain.exportingData = false;
        return { result: false, msg: 'error' };
      }
    } else {
      ConfigMain.exportingData = false;
      return { result: false, msg: 'canceled' };
    }
  }

  /**
   * @name import
   * @summary Import a Polkadot Live data file.
   */
  static async import(): Promise<ImportResult> {
    // Exit early if overlay is created.
    if (WindowsController.overlayExists()) {
      return { result: false, msg: 'alreadyOpen' };
    }

    // Render transparent browser window over base window.
    const overlay = WindowsController.getOverlay();
    if (!overlay) {
      return { result: false, msg: 'error' };
    }

    const { canceled, filePaths } = await dialog.showOpenDialog(overlay, {
      title: 'Import Data',
      filters: [
        {
          name: 'Text Files',
          extensions: ['txt'],
        },
      ],
      properties: ['openFile'],
    });

    WindowsController.destroyOverlay();
    if (!canceled && filePaths.length) {
      try {
        const serialized = await fsPromises.readFile(filePaths[0], {
          encoding: 'utf-8',
        });
        return { result: true, msg: 'success', data: { serialized } };
      } catch (err) {
        return { result: false, msg: 'error' };
      }
    } else {
      return { result: false, msg: 'canceled' };
    }
  }

  /**
   * @name getExportData
   * @summary Return serialized backup data which should be written to a text file.
   */
  private static getExportData(): string {
    const map = new Map<string, string>();
    const addresses = AddressesController.getBackupData();
    const events = EventsController.getBackupData();
    const intervals = IntervalsController.getBackupData();
    const accountTasks = SubscriptionsController.getBackupData();

    map.set('version', version);
    map.set('addresses', addresses);
    map.set('events', events);
    map.set('intervals', intervals);
    map.set('accountTasks', accountTasks);

    return JSON.stringify(Array.from(map));
  }
}
