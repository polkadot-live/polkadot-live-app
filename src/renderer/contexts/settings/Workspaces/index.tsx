// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext, useState } from 'react';
import type { WorkspacesContextInterface } from './types';
import type { WorkspaceItem } from '@/types/developerConsole/workspaces';

export const WorkspacesContext = createContext<WorkspacesContextInterface>(
  defaults.defaultWorkspacesContext
);

export const useWorkspaces = () => useContext(WorkspacesContext);

export const WorkspacesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);

  /// Add a new workspace.
  const addWorkspace = (workspace: WorkspaceItem) => {
    setWorkspaces((prev) => {
      const filtered = prev.filter((ws) => ws.label !== workspace.label);
      return [...filtered, workspace];
    });
  };

  /// Remove a workspace (identified by label).
  const removeWorkspace = (workspace: WorkspaceItem) => {
    setWorkspaces((prev) => prev.filter((ws) => ws.label !== workspace.label));
  };

  return (
    <WorkspacesContext.Provider
      value={{ workspaces, setWorkspaces, addWorkspace, removeWorkspace }}
    >
      {children}
    </WorkspacesContext.Provider>
  );
};
