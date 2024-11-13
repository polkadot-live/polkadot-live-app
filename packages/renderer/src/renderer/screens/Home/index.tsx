// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigRenderer } from '@ren/config/processes/renderer';
import { useEffect } from 'react';
import { useAddresses } from '@app/contexts/main/Addresses';
import { useAppSettings } from '@app/contexts/main/AppSettings';
import { useBootstrapping } from '@app/contexts/main/Bootstrapping';
import { useConnections } from '@ren/renderer/contexts/common/Connections';
import { useEvents } from '@app/contexts/main/Events';
import { useInitIpcHandlers } from '@app/hooks/useInitIpcHandlers';
import { useMainMessagePorts } from '@app/hooks/useMainMessagePorts';
import { Summary } from '@app/screens/Home/Summary';
import { Events } from './Events';
import { Manage } from './Manage';
import { FixedFlexWrapper, IconWrapper } from './Wrappers';
import IconSVG from '@app/svg/polkadotIcon.svg?react';

/** Library */
import { BodyInterfaceWrapper } from '@app/Wrappers';
import {
  Header,
  Footer,
  SideNav,
  GridSpinner,
} from '@polkadot-live/ui/components';
import { ScrollWrapper } from '@polkadot-live/ui/styles';
import { useSideNav } from '@polkadot-live/ui/contexts';

/** Types */
import type { ChainID } from '@polkadot-live/types/chains';
import type { EventCallback } from '@polkadot-live/types/reporter';
import type { IpcRendererEvent } from 'electron';

export const Home = () => {
  // Set up port communication for the `main` renderer.
  useMainMessagePorts();

  // Set up app initialization and online/offline switching handlers.
  useInitIpcHandlers();

  const { getAddresses } = useAddresses();
  const { addEvent, markStaleEvent, removeOutdatedEvents } = useEvents();
  const { darkMode } = useConnections();
  const {
    dockToggled,
    sideNavCollapsed,
    handleDockedToggle,
    handleSideNavCollapse,
  } = useAppSettings();
  const { selectedId, setSelectedId } = useSideNav();

  // Get app loading flag.
  const { appLoading } = useBootstrapping();

  useEffect(() => {
    // Listen for event callbacks.
    window.myAPI.reportNewEvent(
      (_: IpcRendererEvent, eventData: EventCallback) => {
        // Remove any outdated events in the state, if setting enabled.
        if (!ConfigRenderer.keepOutdatedEvents) {
          removeOutdatedEvents(eventData);
        }

        // Add received event to state.
        addEvent({ ...eventData });
      }
    );

    // Listen for stale events.
    window.myAPI.reportStaleEvent(
      (_: IpcRendererEvent, uid: string, chainId: ChainID) => {
        markStaleEvent(uid, chainId);
      }
    );
  }, []);

  /// TODO: Move to file.
  /// Handle header dock toggle.
  const onDockToggle = () => {
    handleDockedToggle();

    ConfigRenderer.portToSettings?.postMessage({
      task: 'settings:set:dockedWindow',
      data: {
        docked: !dockToggled,
      },
    });

    // Analytics.
    const event = `setting-toggle-${!dockToggled ? 'on' : 'off'}`;
    window.myAPI.umamiEvent(event, { setting: 'dock-window' });
  };

  return (
    <>
      <Header
        showButtons={true}
        appLoading={appLoading}
        darkMode={darkMode}
        dockToggled={dockToggled}
        onDockToggle={onDockToggle}
        onRestoreWindow={() => window.myAPI.restoreWindow('base')}
        onThemeToggle={() => window.myAPI.relayModeFlag('darkMode', !darkMode)}
      />

      <FixedFlexWrapper>
        {/* Side Navigation */}
        <SideNav
          handleSideNavCollapse={handleSideNavCollapse}
          navState={{
            isCollapsed: sideNavCollapsed,
            selectedId,
            setSelectedId,
          }}
        />

        <BodyInterfaceWrapper $maxHeight>
          <IconWrapper>
            <IconSVG width={175} opacity={appLoading ? 0.01 : 0.02} />
          </IconWrapper>

          {appLoading ? (
            <div className="app-loading">
              <GridSpinner />
              <p>Loading Polkadot Live</p>
            </div>
          ) : (
            <ScrollWrapper>
              {/* Summary */}
              {selectedId === 0 && <Summary />}

              {/* Events */}
              {selectedId === 1 && <Events />}

              {/* Subscribe */}
              {selectedId === 2 && (
                <div className="container">
                  <Manage addresses={getAddresses()} />
                </div>
              )}
            </ScrollWrapper>
          )}
        </BodyInterfaceWrapper>
      </FixedFlexWrapper>
      <Footer />
    </>
  );
};
