// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigRenderer } from '@/config/processes/renderer';
import { BodyInterfaceWrapper } from '@app/Wrappers';
import { useAddresses } from '@/renderer/contexts/main/Addresses';
import { useEvents } from '@/renderer/contexts/main/Events';
import { Footer } from '@app/library/Footer';
import { Header } from '@app/library/Header';
import { useEffect, useState } from 'react';
import IconSVG from '@app/svg/polkadotIcon.svg?react';
import { Events } from './Events';
import { Manage } from './Manage';
import { IconWrapper } from './Wrappers';
import { useBootstrapping } from '@app/contexts/main/Bootstrapping';
import { useInitIpcHandlers } from '@app/hooks/useInitIpcHandlers';
import { useMainMessagePorts } from '@/renderer/hooks/useMainMessagePorts';
import { useAppModesSyncing } from '@/renderer/hooks/useAppModesSyncing';
import { SideNav } from '@/renderer/library/SideNav';
import { ScrollWrapper } from '@/renderer/library/utils';
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
  const [selected, setSelected] = useState(0);

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
      <div
        style={{
          display: 'flex',
          width: '100%',
          position: 'fixed',
          top: '3rem',
          bottom: '3rem',
          left: 0,
          color: 'rgb(241 245 249)',
        }}
      >
        <SideNav selected={selected} setSelected={setSelected} />

        <BodyInterfaceWrapper $maxHeight>
          {appLoading && (
            <>
              <IconWrapper>
                <IconSVG width={175} opacity={0.01} />
              </IconWrapper>
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
            </>
          )}
          {/* Summary */}
          {!appLoading && selected === 0 && (
            <ScrollWrapper>
              <IconWrapper>
                <IconSVG width={175} opacity={0.02} />
              </IconWrapper>
              <div style={{ padding: '2rem 1rem' }}>
                <h1>Summary</h1>
              </div>
            </ScrollWrapper>
          )}
          {/* Events */}
          {!appLoading && selected === 1 && (
            <ScrollWrapper>
              <IconWrapper>
                <IconSVG width={175} opacity={0.02} />
              </IconWrapper>
              <Events />
            </ScrollWrapper>
          )}
          {/* Subscribe */}
          {!appLoading && selected === 2 && (
            <ScrollWrapper>
              <IconWrapper>
                <IconSVG width={175} opacity={0.02} />
              </IconWrapper>
              <div className="container">
                <Manage addresses={getAddresses()} />
              </div>
            </ScrollWrapper>
          )}
        </BodyInterfaceWrapper>
      </div>
      <Footer />
    </>
  );
};
