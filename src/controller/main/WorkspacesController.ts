// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigMain } from '@/config/processes/main';
import { store } from '@/main';
import type { WorkspaceItem } from '@/types/developerConsole/workspaces';
import type { AnyData } from '@/types/misc';

export class WorkspacesController {
  private static storageKey = ConfigMain.workspacesStorageKey;

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

  /// Remove existing workspace.
  static removeWorkspace(workspaceItem: WorkspaceItem) {
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

  /// Utility: Fetch workspaces from store.
  private static fetchWorkspacesFromStore(): string {
    const stored = (store as Record<string, AnyData>).get(
      this.storageKey
    ) as string;
    return stored;
  }
}
