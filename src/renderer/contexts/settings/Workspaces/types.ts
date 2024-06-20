// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { WorkspaceItem } from '@/types/developerConsole/workspaces';

export interface WorkspacesContextInterface {
  workspaces: WorkspaceItem[];
  setWorkspaces: React.Dispatch<React.SetStateAction<WorkspaceItem[]>>;
  addWorkspace: (workspace: WorkspaceItem) => void;
  launchWorkspace: (workspace: WorkspaceItem) => void;
  removeWorkspace: (workspace: WorkspaceItem) => void;
}
