// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { WorkspaceRowWrapper } from '../Wrappers';
import { faHashtag } from '@fortawesome/pro-light-svg-icons';
import { ControlsWrapper, SortControlButton } from '@/renderer/utils/common';
import { faLinkSimple, faTrash } from '@fortawesome/pro-solid-svg-icons';
import { useTooltip } from '@/renderer/contexts/common/Tooltip';

interface WorkspaceRowProps {
  index: number;
  label: string;
  createdAt: string;
}

export const WorkspaceRow = ({
  index,
  label,
  createdAt,
}: WorkspaceRowProps) => {
  const { wrapWithTooltip } = useTooltip();

  return (
    <WorkspaceRowWrapper key={`${index}_${label}`}>
      <>
        <div className="stat-wrapper">
          <span>
            <FontAwesomeIcon icon={faHashtag} transform={'shrink-0'} />
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
                isDisabled={false}
                faIcon={faLinkSimple}
                onClick={() => console.log('todo')}
                fixedWidth={false}
              />,
              'Launch In Console'
            )}
            {wrapWithTooltip(
              <SortControlButton
                isActive={true}
                isDisabled={false}
                faIcon={faTrash}
                onClick={() => console.log('todo')}
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
