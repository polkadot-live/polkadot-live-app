// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { WorkspaceRowWrapper } from '../Wrappers';
import { faHashtag, faTrash, faLink } from '@fortawesome/free-solid-svg-icons';
import {
  ControlsWrapper,
  SortControlButton,
} from '@polkadot-live/ui/components';
import { useTooltip, useOverlay } from '@polkadot-live/ui/contexts';
import { useWebsocketServer, useWorkspaces } from '@ren/contexts/settings';
import { Confirm } from './Confirm';
import type { WorkspaceRowProps } from '../types';

export const WorkspaceRow = ({ workspace }: WorkspaceRowProps) => {
  const { createdAt, index, label } = workspace;

  const { wrapWithTooltip } = useTooltip();
  const { openOverlayWith } = useOverlay();
  const { launchWorkspace } = useWorkspaces();
  const { isListening } = useWebsocketServer();

  /// Handle delete button click.
  const handleDelete = () =>
    openOverlayWith(<Confirm workspace={workspace} />, 'small');

  /// Handle launch button click.
  const handleLaunch = () => launchWorkspace(workspace);

  return (
    <WorkspaceRowWrapper key={`${index}_${label}`}>
      <>
        <div className="stat-wrapper">
          <span>
            <FontAwesomeIcon icon={faHashtag} transform={'shrink-2'} />
            {index}
          </span>
        </div>
        <div className="workspace-label">
          <span>{label}</span>
          <span>{createdAt}</span>
        </div>
        <div>
          <ControlsWrapper
            style={{ marginBottom: 0 }}
            className="button-tweaks"
          >
            {wrapWithTooltip(
              <SortControlButton
                isActive={true}
                isDisabled={!isListening || true} // enable when developer console integrated
                faIcon={faLink}
                onClick={() => handleLaunch()}
                fixedWidth={false}
              />,
              'Launch In Console'
            )}
            {wrapWithTooltip(
              <SortControlButton
                isActive={true}
                isDisabled={false}
                faIcon={faTrash}
                onClick={() => handleDelete()}
                fixedWidth={false}
              />,
              'Delete'
            )}
          </ControlsWrapper>
        </div>
      </>
    </WorkspaceRowWrapper>
  );
};
