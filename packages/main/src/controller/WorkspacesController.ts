// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigMain } from '@/config/main';
import { WebsocketsController } from './WebsocketsController';
import { store } from '@/main';
import type { AnyData } from '@polkadot-live/types/misc';
import type { IpcTask } from '@polkadot-live/types/communication';
import type { WorkspaceItem } from '@polkadot-live/types/developerConsole/workspaces';

export class WorkspacesController {
  private static storageKey = ConfigMain.workspacesStorageKey;

  /// Process a received IPC task.
  static process(task: IpcTask) {
    switch (task.action) {
      // Handle deleting a workspace from Electron store.
      case 'workspaces:delete': {
        try {
          const { serialized }: { serialized: string } = task.data;
          this.removeWorkspace(JSON.parse(serialized));
        } catch (error) {
          if (error instanceof SyntaxError) {
            console.error(error.message);
          }
        }
        break;
      }
      // Handle emitting workspace to developer console.
      case 'workspaces:launch': {
        try {
          const { serialized }: { serialized: string } = task.data;
          WebsocketsController.launchWorkspace(JSON.parse(serialized));
        } catch (error) {
          if (error instanceof SyntaxError) {
            console.error(error.message);
          }
        }
        break;
      }
    }
  }

  /// Fetch workspaces from store.
  static fetchPersistedWorkspaces(): WorkspaceItem[] {
    const stored = this.fetchWorkspacesFromStore();
    return stored ? JSON.parse(stored) : [];
  }

  /// Add new workspace.
  static addWorkspace(workspaceItem: WorkspaceItem) {
    const stored = this.fetchWorkspacesFromStore();

    if (!stored) {
      const workspaces = [{ ...workspaceItem }];
      (store as Record<string, AnyData>).set(
        this.storageKey,
        JSON.stringify(workspaces)
      );
    } else {
      // Replace an existing workspace if it has the same label.
      const parsed: WorkspaceItem[] = JSON.parse(stored);
      const filtered = parsed.filter(
        (workspace) => workspace.label !== workspaceItem.label
      );

      (store as Record<string, AnyData>).set(
        this.storageKey,
        JSON.stringify([...filtered, { ...workspaceItem }])
      );
    }
  }

  /// Update an existing workspace.
  static updateWorkspace(workspaceItem: WorkspaceItem) {
    const stored = this.fetchWorkspacesFromStore();
    if (!stored) {
      return;
    }

    const parsed: WorkspaceItem[] = JSON.parse(stored);
    (store as Record<string, AnyData>).set(
      this.storageKey,
      JSON.stringify([
        ...parsed.map((workspace) =>
          workspace.label === workspaceItem.label ? workspaceItem : workspace
        ),
      ])
    );
  }

  /// Remove existing workspace.
  private static removeWorkspace(workspaceItem: WorkspaceItem) {
    const stored = this.fetchWorkspacesFromStore();
    if (!stored) {
      return;
    }

    const parsed: WorkspaceItem[] = JSON.parse(stored);
    (store as Record<string, AnyData>).set(
      this.storageKey,
      JSON.stringify([
        ...parsed.filter(
          (workspace) => workspace.label !== workspaceItem.label
        ),
      ])
    );
  }

  /// Utility: Fetch workspaces from store.
  private static fetchWorkspacesFromStore(): string {
    const stored = (store as Record<string, AnyData>).get(
      this.storageKey
    ) as string;
    return stored;
  }
}
