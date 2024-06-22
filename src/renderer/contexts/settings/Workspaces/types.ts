// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { WorkspaceItem } from '@/types/developerConsole/workspaces';

export interface WorkspacesContextInterface {
  workspaces: WorkspaceItem[];
  setWorkspaces: React.Dispatch<React.SetStateAction<WorkspaceItem[]>>;
  addWorkspace: (workspace: WorkspaceItem) => void;
  getOrderedWorkspaces: () => WorkspaceItem[];
  launchWorkspace: (workspace: WorkspaceItem) => void;
  removeWorkspace: (workspace: WorkspaceItem) => void;
}
