// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { BodyInterfaceWrapper } from '@app/Wrappers';
import { useAddresses } from '@app/contexts/Addresses';
import { useChains } from '@app/contexts/Chains';
import { useEvents } from '@app/contexts/Events';
import { Footer } from '@app/library/Footer';
import { Header } from '@app/library/Header';
import { useEffect, useState } from 'react';
import { ReactComponent as IconSVG } from '@app/svg/polkadotIcon.svg';
import { Events } from './Events';
import { Manage } from './Manage';
import { CarouselWrapper, IconWrapper, TabsWrapper } from './Wrappers';
import { AnyJson } from '@/types/misc';
import { ChainID } from '@/types/chains';

export const Home = () => {
  const { getAddresses } = useAddresses();
  const { addChain, removeChain, setChain } = useChains();
  const { addEvent, dismissEvent } = useEvents();

  // Store the currently active menu tab.
  const [section, setSection] = useState<number>(0);

  // Listen for changes in chains.
  // TODO: move to a new hook to manage communication between main and renderer.
  useEffect(() => {
    window.myAPI.syncChain((_: Event, name: ChainID) => {
      addChain(name, 'connected');
    });

    window.myAPI.chainAdded((_: Event, name: ChainID) => {
      addChain(name, 'connecting');
    });

    window.myAPI.chainRemoved((_: Event, name: ChainID) => {
      removeChain(name);
    });

    window.myAPI.chainConnected((_: Event, name: ChainID) => {
      console.log('chain connected: ', name);
      setChain({
        name,
        status: 'connected',
      });
    });

    window.myAPI.chainDisconnected((_: Event, name: ChainID) => {
      console.log('chain disconnected: ', name);
      setChain({
        name,
        status: 'disconnected',
      });
    });

    // Listen for event callbacks.
    window.myAPI.reportNewEvent((_: Event, eventData: AnyJson) => {
      addEvent(eventData);
    });

    // Listen for dismiss callbacks.
    window.myAPI.reportDismissEvent((_: Event, eventData: AnyJson) => {
      dismissEvent(eventData);
    });
  }, []);

  return (
    <>
      <Header showMenu={true} />
      <TabsWrapper>
        <button
          type="button"
          className={section === 0 ? 'active' : undefined}
          onClick={() => {
            setSection(0);
          }}
        >
          <span>Events</span>
        </button>
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
          <div className="scrollable">
            <IconWrapper>
              <IconSVG width={175} opacity={0.08} />
            </IconWrapper>
            <Events addresses={getAddresses()} />
          </div>
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
