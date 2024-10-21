// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigRenderer } from '@/config/processes/renderer';
import { BodyInterfaceWrapper } from '@app/Wrappers';
import { useAddresses } from '@/renderer/contexts/main/Addresses';
import { useEvents } from '@/renderer/contexts/main/Events';
import { Footer, Header, SideNav } from '@app/library/components';
import { useEffect } from 'react';
import { useSideNav } from '@/renderer/library/contexts';
import IconSVG from '@app/svg/polkadotIcon.svg?react';
import { Events } from './Events';
import { Manage } from './Manage';
import { FixedFlexWrapper, IconWrapper } from './Wrappers';
import { useBootstrapping } from '@app/contexts/main/Bootstrapping';
import { useInitIpcHandlers } from '@app/hooks/useInitIpcHandlers';
import { useMainMessagePorts } from '@/renderer/hooks/useMainMessagePorts';
import { useAppModesSyncing } from '@/renderer/hooks/useAppModesSyncing';
import { ScrollWrapper } from '@/renderer/library/styles';
import { Summary } from '@/renderer/screens/Home/Summary';
import type { ChainID } from '@/types/chains';
import type { EventCallback } from '@/types/reporter';
import type { IpcRendererEvent } from 'electron';

export const Home = () => {
  // Set up port communication for the `main` renderer.
  useMainMessagePorts();
  useAppModesSyncing();

  // Set up app initialization and online/offline switching handlers.
  useInitIpcHandlers();

  const { getAddresses } = useAddresses();
  const { addEvent, markStaleEvent, removeOutdatedEvents } = useEvents();

  // Get app loading flag.
  const { appLoading } = useBootstrapping();
  const { selectedId } = useSideNav();

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

  return (
    <>
      <Header showMenu={true} appLoading={appLoading} />
      <FixedFlexWrapper>
        {/* Side Navigation */}
        <SideNav />

        <BodyInterfaceWrapper $maxHeight>
          <IconWrapper>
            <IconSVG width={175} opacity={appLoading ? 0.01 : 0.02} />
          </IconWrapper>

          {appLoading ? (
            <div className="app-loading">
              <div className="lds-grid">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
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
