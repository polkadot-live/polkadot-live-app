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
import { useEffect } from 'react';
import { useWorkspaces } from '@/renderer/contexts/settings/Workspaces';

export const Workspaces = () => {
  const { isListening, startServer, stopServer } = useWebsocketServer();
  const { workspaces, getOrderedWorkspaces, setWorkspaces, addWorkspace } =
    useWorkspaces();

  /// Fetch workspaces from store when component loads.
  useEffect(() => {
    const fetchWorkspaces = async () => {
      const result = await window.myAPI.fetchPersistedWorkspaces();
      setWorkspaces(result);
    };
    fetchWorkspaces();
  }, []);

  /// Handle connect button click.
  const handleConnectButtonClick = async () => {
    if (isListening) {
      await stopServer();
    } else {
      await startServer();
    }
  };

  /// Handle receiving a workspace from the main process.
  window.myAPI.reportWorkspace((_, serialised) => {
    try {
      addWorkspace(JSON.parse(serialised));
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error(error.message);
      }
    }
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
              onClick={async () => await handleConnectButtonClick()}
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
            {workspaces.length ? (
              <>
                {getOrderedWorkspaces().map((workspace) => (
                  <WorkspaceRow
                    key={`${workspace.index}_${workspace.label}`}
                    workspace={workspace}
                  />
                ))}
              </>
            ) : (
              <div style={{ padding: '0 1.5rem' }}>
                <p>No workspaces.</p>
              </div>
            )}
          </WorkspacesContainer>
        </>
      </AccordionPanel>
    </AccordionItem>
  );
};
