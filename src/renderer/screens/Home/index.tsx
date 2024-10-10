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
import { CarouselWrapper, IconWrapper, TabsWrapper } from './Wrappers';
import { useBootstrapping } from '@app/contexts/main/Bootstrapping';
import { useInitIpcHandlers } from '@app/hooks/useInitIpcHandlers';
import { useMainMessagePorts } from '@/renderer/hooks/useMainMessagePorts';
import { useAppModesSyncing } from '@/renderer/hooks/useAppModesSyncing';
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

  // Store the currently active menu tab.
  const [section, setSection] = useState<number>(0);

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
      <TabsWrapper>
        {/* Events Button */}
        <button
          type="button"
          className={section === 0 ? 'active' : undefined}
          onClick={() => {
            setSection(0);
          }}
        >
          <span>Events</span>
        </button>
        {/* Manage Button */}
        <button
          type="button"
          disabled={appLoading}
          className={section === 1 ? 'active' : undefined}
          style={{ opacity: appLoading ? '0.3' : '1' }}
          onClick={() => {
            setSection(1);
          }}
        >
          <span>Subscriptions</span>
        </button>
      </TabsWrapper>

      <BodyInterfaceWrapper $maxHeight>
        <CarouselWrapper
          animate={section === 0 ? 'home' : 'next'}
          transition={{
            duration: 0.35,
            type: 'spring',
            bounce: 0.1,
          }}
          variants={{
            home: {
              left: 0,
            },
            next: {
              left: '-100%',
            },
          }}
        >
          {/* Render Events Content */}
          <div className="scrollable">
            {appLoading ? (
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
            ) : (
              <>
                <IconWrapper>
                  <IconSVG width={175} opacity={0.02} />
                </IconWrapper>
                <Events />
              </>
            )}
          </div>
          {/* Render Subscriptions Content */}
          <div>
            <IconWrapper>
              <IconSVG width={175} opacity={0.02} />
            </IconWrapper>
            <div className="container">
              {!appLoading && <Manage addresses={getAddresses()} />}
            </div>
          </div>
        </CarouselWrapper>
      </BodyInterfaceWrapper>
      <Footer />
    </>
  );
};
