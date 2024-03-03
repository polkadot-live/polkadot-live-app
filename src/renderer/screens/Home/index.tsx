// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { BodyInterfaceWrapper } from '@app/Wrappers';
import { useAddresses } from '@app/contexts/Addresses';
import { useChains } from '@app/contexts/Chains';
import { useEvents } from '@app/contexts/Events';
import { Footer } from '@app/library/Footer';
import { Header } from '@app/library/Header';
import { useEffect, useState } from 'react';
import IconSVG from '@app/svg/polkadotIcon.svg?react';
import { Events } from './Events';
import { Manage } from './Manage';
import { CarouselWrapper, IconWrapper, TabsWrapper } from './Wrappers';
import type { AnyJson } from '@/types/misc';
import type { ChainID } from '@/types/chains';
import type { FlattenedAPIData } from '@/types/apis';
import type { IpcRendererEvent } from 'electron';
import type { DismissEvent } from '@/types/reporter';

export const Home = () => {
  const { getAddresses } = useAddresses();
  const { removeChain, setChain } = useChains();
  const { addEvent, dismissEvent } = useEvents();

  // Store the currently active menu tab.
  const [section, setSection] = useState<number>(0);

  // Listen for changes in chains.
  // TODO: move to a new hook to manage communication between main and renderer.
  useEffect(() => {
    window.myAPI.chainRemoved((_: IpcRendererEvent, name: ChainID) => {
      removeChain(name);
    });

    // NOTE: Not being called from main process.
    window.myAPI.chainConnected(
      (_: IpcRendererEvent, apiData: FlattenedAPIData) => {
        console.log('chain connected: ', apiData);
        setChain(apiData);
      }
    );

    // NOTE: Not being called from main process.
    window.myAPI.chainDisconnected(
      (_: IpcRendererEvent, apiData: FlattenedAPIData) => {
        console.log('chain disconnected: ', apiData);
        setChain(apiData);
      }
    );

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
      <Header showMenu={true} />
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
            <IconWrapper>
              <IconSVG width={175} opacity={0.08} />
            </IconWrapper>
            <Events />
          </div>
          {/* Render Manage Content */}
          <div>
            <div className="container">
              <Manage addresses={getAddresses()} />
            </div>
          </div>
        </CarouselWrapper>
      </BodyInterfaceWrapper>
      <Footer />
    </>
  );
};
