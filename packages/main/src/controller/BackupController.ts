// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { promises as fsPromises } from 'node:fs';
import { dialog } from 'electron';
import { version } from '../../package.json';
import { SharedState } from '../config/SharedState';
import {
  AddressesController,
  EventsController,
  ExtrinsicsController,
  IntervalsController,
  SubscriptionsController,
  WindowsController,
} from '../controller';
import type { ExportResult, ImportResult } from '@polkadot-live/types/backup';

export class BackupController {
  // Export Polkadot Live data to a text file.
  static async export(): Promise<ExportResult> {
    // Exit early if overlay is created.
    if (process.platform === 'linux') {
      WindowsController.setBaseAlwaysOnTop(false);
    } else if (WindowsController.overlayExists()) {
      return { result: false, msg: 'alreadyOpen' };
    }

    // Return early if export dialog is already open.
    if (SharedState.get('backup:exporting')) {
      return { result: false, msg: 'executing' };
    }

    // Render transparent browser window over base window.
    SharedState.set('backup:exporting', true);
    let overlay = null;
    if (process.platform !== 'linux') {
      overlay = WindowsController.getOverlay();
      if (!overlay) {
        return { result: false, msg: 'error' };
      }
    }

    const dialogOptions = {
      title: 'Export Data',
      defaultPath: 'polkadot-live-data.txt',
      filters: [
        {
          name: 'Text Files',
          extensions: ['txt'],
        },
      ],
      properties: [],
    };

    const { canceled, filePath } =
      process.platform === 'linux'
        ? await dialog.showSaveDialog(dialogOptions)
        : await dialog.showSaveDialog(overlay!, dialogOptions);

    // Handle save or cancel.
    process.platform === 'linux'
      ? WindowsController.setBaseAlwaysOnTop(true)
      : WindowsController.destroyOverlay();

    if (!canceled && filePath) {
      try {
        const serialized = BackupController.getExportData();
        await fsPromises.writeFile(filePath, serialized, {
          encoding: 'utf8',
        });

        SharedState.set('backup:exporting', false);
        return { result: true, msg: 'success' };
      } catch (err) {
        console.error(err);
        SharedState.set('backup:exporting', false);
        return { result: false, msg: 'error' };
      }
    } else {
      SharedState.set('backup:exporting', false);
      return { result: false, msg: 'canceled' };
    }
  }

  // Import a Polkadot Live data file.
  static async import(): Promise<ImportResult> {
    // Exit early if overlay is created.
    if (process.platform === 'linux') {
      WindowsController.setBaseAlwaysOnTop(false);
    } else if (WindowsController.overlayExists()) {
      return { result: false, msg: 'alreadyOpen' };
    }

    // Render transparent browser window over base window (Mac and Windows).
    let overlay = null;
    if (process.platform !== 'linux') {
      overlay = WindowsController.getOverlay();
      if (!overlay) {
        return { result: false, msg: 'error' };
      }
    }

    const dialogOptions: Electron.OpenDialogOptions = {
      title: 'Import Data',
      filters: [
        {
          name: 'Text Files',
          extensions: ['txt'],
        },
      ],
      properties: ['openFile'],
    };

    // Show open file dialog.
    const { canceled, filePaths } =
      process.platform === 'linux'
        ? await dialog.showOpenDialog(dialogOptions)
        : await dialog.showOpenDialog(overlay!, dialogOptions);

    // After open file dialog is closed.
    process.platform === 'linux'
      ? WindowsController.setBaseAlwaysOnTop(true)
      : WindowsController.destroyOverlay();

    if (!canceled && filePaths.length) {
      try {
        const serialized = await fsPromises.readFile(filePaths[0], {
          encoding: 'utf-8',
        });
        return { result: true, msg: 'success', data: { serialized } };
      } catch (err) {
        console.error(err);
        return { result: false, msg: 'error' };
      }
    } else {
      return { result: false, msg: 'canceled' };
    }
  }

  // Return serialized backup data for writing to a text file.
  private static getExportData(): string {
    const map = new Map<string, string>();
    const addresses = AddressesController.getBackupData();
    const events = EventsController.getBackupData();
    const extrinsics = ExtrinsicsController.getBackupData();
    const intervals = IntervalsController.getBackupData();
    const accountTasks = SubscriptionsController.getBackupData();

    map.set('version', version);
    map.set('addresses', addresses);
    map.set('events', events);
    map.set('extrinsics', extrinsics);
    map.set('intervals', intervals);
    map.set('accountTasks', accountTasks);

    return JSON.stringify(Array.from(map));
  }
}
