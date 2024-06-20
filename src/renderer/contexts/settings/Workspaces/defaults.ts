// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */

import type { WorkspacesContextInterface } from './types';

export const defaultWorkspacesContext: WorkspacesContextInterface = {
  workspaces: [],
  setWorkspaces: () => {},
  addWorkspace: () => {},
  removeWorkspace: () => {},
};
