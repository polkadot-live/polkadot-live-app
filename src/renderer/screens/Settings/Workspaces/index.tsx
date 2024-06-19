// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccordionItem, AccordionPanel } from '@/renderer/library/Accordion';
import { AccordionCaretHeader } from '@/renderer/library/Accordion/AccordionCaretHeaders';
import { WorkspacesContainer } from '../Wrappers';
import { WorkspaceRow } from './WorkspaceRow';
import { ControlsWrapper, SortControlButton } from '@/renderer/utils/common';
import { faPlug } from '@fortawesome/pro-light-svg-icons';
import { faPlugCircleXmark } from '@fortawesome/pro-solid-svg-icons';
import { useWebsocketServer } from '@/renderer/contexts/settings/WebsocketServer';

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
  const { isListening, startListening, stopListening } = useWebsocketServer();

  const handleClickConnectButton = async () => {
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
    }
  };

  /// Handle receiving a workspace from the main process.
  window.myAPI.reportWorkspace((_, serialized) => {
    console.log('> Received workspace');
    console.log(serialized);

    // TODO: Deserialise data
    // TODO: Check if workspace exists and update if necessary
    // TODO: Persist workspace to state + store if new
  });

  return (
    <AccordionItem key={`workspaces_settings`}>
      <AccordionCaretHeader
        title="Workspaces - Developer Console"
        itemIndex={3}
        wide={true}
      />
      <AccordionPanel>
        <>
          <ControlsWrapper
            $padBottom={false}
            style={{ margin: '2rem 0', alignItems: 'baseline' }}
          >
            <SortControlButton
              isActive={!isListening}
              isDisabled={false}
              onLabel="Connect"
              offLabel="Disconnect"
              faIcon={isListening ? faPlugCircleXmark : faPlug}
              fixedWidth={false}
              onClick={async () => await handleClickConnectButton()}
            />
            <span
              style={{
                fontSize: '0.95rem',
                color: isListening ? 'lightgreen' : 'red',
              }}
            >
              {isListening ? 'Connected' : 'Disconnected'}
            </span>
          </ControlsWrapper>

          <WorkspacesContainer>
            {workspacesSample.map(({ createdAt, label, index }) => (
              <WorkspaceRow
                key={`${index}_${label}`}
                label={label}
                index={index}
                createdAt={createdAt}
              />
            ))}
          </WorkspacesContainer>
        </>
      </AccordionPanel>
    </AccordionItem>
  );
};
