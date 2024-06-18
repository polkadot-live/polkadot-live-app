// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccordionItem, AccordionPanel } from '@/renderer/library/Accordion';
import { AccordionCaretHeader } from '@/renderer/library/Accordion/AccordionCaretHeaders';
import { WorkspaceRow, WorkspacesContainer } from './Wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHashtag } from '@fortawesome/pro-light-svg-icons';
import { ControlsWrapper, SortControlButton } from '@/renderer/utils/common';
import { faLinkSimple, faTrash } from '@fortawesome/pro-solid-svg-icons';
import { useTooltip } from '@/renderer/contexts/common/Tooltip';
import type { CSSProperties } from 'react';

interface WorkspaceItem {
  label: string;
  createdAt: string;
  index: number;
}

const workspacesSample: WorkspaceItem[] = [
  {
    label: 'Workspace Label 1',
    createdAt: '06/18/2024',
    index: 1,
  },
  {
    label: 'Workspace Label 2',
    createdAt: '06/14/2024',
    index: 2,
  },
  {
    label: 'Workspace Label 3',
    createdAt: '06/10/2024',
    index: 3,
  },
];

export const Workspaces = () => {
  const { setTooltipTextAndOpen } = useTooltip();

  const wrapWithTooltip = (
    Inner: React.ReactNode,
    text: string,
    styles?: CSSProperties
  ) => (
    <div
      style={styles ? styles : {}}
      className="tooltip-trigger-element"
      data-tooltip-text={text}
      onMouseMove={() => setTooltipTextAndOpen(text)}
    >
      {Inner}
    </div>
  );

  return (
    <AccordionItem key={`workspaces_settings`}>
      <AccordionCaretHeader
        title="Workspaces - Developer Console"
        itemIndex={3}
        wide={true}
      />
      <AccordionPanel>
        <WorkspacesContainer>
          {workspacesSample.map(({ createdAt, label, index }) => (
            <WorkspaceRow key={`${index}_${label}`}>
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
            </WorkspaceRow>
          ))}
        </WorkspacesContainer>
      </AccordionPanel>
    </AccordionItem>
  );
};
