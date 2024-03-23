// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { BodyInterfaceWrapper } from '@app/Wrappers';
import { useAddresses } from '@app/contexts/Addresses';
import { useEvents } from '@app/contexts/Events';
import { Footer } from '@app/library/Footer';
import { Header } from '@app/library/Header';
import { useEffect, useState } from 'react';
import IconSVG from '@app/svg/polkadotIcon.svg?react';
import { Events } from './Events';
import { Manage } from './Manage';
import { CarouselWrapper, IconWrapper, TabsWrapper } from './Wrappers';
import type { AnyJson } from '@/types/misc';
import type { IpcRendererEvent } from 'electron';
import type { DismissEvent } from '@/types/reporter';
import { useInitIpcHandlers } from '@app/hooks/useInitIpcHandlers';

export const Home = () => {
  const { getAddresses } = useAddresses();
  const { addEvent, dismissEvent } = useEvents();

  // Set up app initialization and online/offline switching handlers.
  const { appLoading } = useInitIpcHandlers();

  // Store the currently active menu tab.
  const [section, setSection] = useState<number>(0);

  useEffect(() => {
    // Listen for event callbacks.
    window.myAPI.reportNewEvent((_: IpcRendererEvent, eventData: AnyJson) => {
      addEvent(eventData);
    });

    // Listen for dismiss callbacks.
    window.myAPI.reportDismissEvent(
      (_: IpcRendererEvent, eventData: DismissEvent) => {
        dismissEvent(eventData);
      }
    );
  }, []);

  return (
    <>
      {!appLoading && <Header showMenu={true} />}
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
          onClick={() => {
            setSection(1);
          }}
        >
          <span>Manage</span>
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
                  <IconSVG width={175} opacity={0.02} />
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
                  <IconSVG width={175} opacity={0.08} />
                </IconWrapper>
                <Events />
              </>
            )}
          </div>
          {/* Render Manage Content */}
          <div>
            <div className="container">
              {!appLoading && <Manage addresses={getAddresses()} />}
            </div>
          </div>
        </CarouselWrapper>
      </BodyInterfaceWrapper>
      {!appLoading && <Footer />}
    </>
  );
};
