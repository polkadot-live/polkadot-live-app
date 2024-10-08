// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigMain } from '@/config/processes/main';
import { dialog } from 'electron';
import { promises as fsPromises } from 'fs';
import { AddressesController } from '@/controller/main/AddressesController';
import { EventsController } from '@/controller/main/EventsController';
import { IntervalsController } from '@/controller/main/IntervalsController';
import { SubscriptionsController } from './SubscriptionsController';
import type { ExportResult, ImportResult } from '@/types/backup';

export class BackupController {
  /**
   * @name export
   * @summary Export Polkadot Live data to a text file.
   */
  static async export(): Promise<ExportResult> {
    // Return early if export dialog is already open.
    if (ConfigMain.exportingData) {
      return { result: false, msg: 'executing' };
    }

    ConfigMain.exportingData = true;

    // TODO: Pass BaseWindow when supported.
    const { canceled, filePath } = await dialog.showSaveDialog({
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
    // TODO: Pass BaseWindow when supported.
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Import Data',
      filters: [
        {
          name: 'Text Files',
          extensions: ['txt'],
        },
      ],
      properties: ['openFile'],
    });

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

    map.set('addresses', addresses);
    map.set('events', events);
    map.set('intervals', intervals);
    map.set('accountTasks', accountTasks);

    return JSON.stringify(Array.from(map));
  }
}
