// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, use, useState } from 'react';
import type { WorkspacesContextInterface } from './types';
import type { WorkspaceItem } from '@polkadot-live/types/developerConsole/workspaces';

export const WorkspacesContext = createContext<WorkspacesContextInterface>(
  defaults.defaultWorkspacesContext
);

export const useWorkspaces = () => use(WorkspacesContext);

export const WorkspacesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);

  /// Get workspaces ordered by index.
  const getOrderedWorkspaces = (): WorkspaceItem[] =>
    workspaces.sort((a, b) => a.index - b.index);

  /// Add a new workspace.
  const addWorkspace = (workspace: WorkspaceItem) => {
    setWorkspaces((prev) => {
      const filtered = prev.filter((ws) => ws.label !== workspace.label);
      return [...filtered, workspace];
    });
  };

  /// Remove a workspace (identified by label).
  const removeWorkspace = (workspace: WorkspaceItem) => {
    window.myAPI.sendWorkspaceTask({
      action: 'workspaces:delete',
      data: { serialized: JSON.stringify(workspace) },
    });
    setWorkspaces((prev) => prev.filter((ws) => ws.label !== workspace.label));
  };

  /// Instruct main process to launch workspace.
  const launchWorkspace = (workspace: WorkspaceItem) => {
    window.myAPI.sendWorkspaceTask({
      action: 'workspaces:launch',
      data: { serialized: JSON.stringify(workspace) },
    });
  };

  return (
    <WorkspacesContext
      value={{
        workspaces,
        setWorkspaces,
        getOrderedWorkspaces,
        addWorkspace,
        launchWorkspace,
        removeWorkspace,
      }}
    >
      {children}
    </WorkspacesContext>
  );
};
