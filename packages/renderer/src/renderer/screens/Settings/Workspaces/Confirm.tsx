// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useOverlay } from '@polkadot-live/ui/contexts';
import { ConfirmWrapper } from '../Wrappers';
import { ButtonMonoInvert, ButtonMono } from '@polkadot-live/ui/kits/buttons';
import { useWorkspaces } from '@app/contexts/settings/Workspaces';
import { Flip, toast } from 'react-toastify';
import type { WorkspaceItem } from '@polkadot-live/types/developerConsole/workspaces';

interface ConfirmProps {
  workspace: WorkspaceItem;
}

export const Confirm = ({ workspace }: ConfirmProps) => {
  const { setStatus } = useOverlay();
  const { removeWorkspace } = useWorkspaces();

  const handleClickConfirm = () => {
    removeWorkspace(workspace);

    toast.success('Workspace deleted successfully.', {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      closeButton: false,
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
      theme: 'dark',
      transition: Flip,
      toastId: `workspace-deleted-${workspace.index}`,
    });

    setStatus(0);
  };

  return (
    <ConfirmWrapper>
      <h3>Delete Workspace</h3>
      <div style={{ margin: '1rem 0 0.5rem' }}>
        <h4>{workspace.label}</h4>
      </div>
      <p>Permenantly delete this workspace from Polkadot Live?</p>
      <div className="footer">
        <ButtonMonoInvert text="Cancel" onClick={() => setStatus(0)} />
        <ButtonMono
          text="Delete Workspace"
          onClick={() => handleClickConfirm()}
        />
      </div>
    </ConfirmWrapper>
  );
};
