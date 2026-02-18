// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEvents } from '@polkadot-live/contexts';
import {
  CarouselWrapper,
  FlexColumn,
  FlexColumnWrap,
} from '@polkadot-live/styles';
import { MainHeading } from '@polkadot-live/ui';
import { useEffect, useState } from 'react';
import { Categories } from './Categories';
import { EventsList } from './EventsList';

export const Events = () => {
  const [section, setSection] = useState<number>(0);
  const { activeCategory } = useEvents();

  useEffect(() => {
    if (activeCategory === null) {
      setSection(0);
    }
  }, [activeCategory]);

  return (
    <FlexColumn
      $rowGap={'1rem'}
      style={{ height: '100%', padding: '2rem 0rem 0' }}
    >
      <MainHeading style={{ padding: '0 1rem' }}>Events</MainHeading>
      <CarouselWrapper
        animate={section === 0 ? 'home' : 'next'}
        transition={{
          duration: 0.35,
          type: 'spring',
          bounce: 0.1,
        }}
        onTransitionEnd={() => {
          /* empty */
        }}
        variants={{
          home: { left: 0 },
          next: { left: '-100%' },
        }}
      >
        <div
          className="scrollable"
          style={{ height: '100%', padding: '0 1rem' }}
        >
          <FlexColumnWrap>
            <Categories setSection={setSection} />
          </FlexColumnWrap>
        </div>
        <div
          className="scrollable"
          style={{ height: '100%', padding: '0 1rem 1rem' }}
        >
          <EventsList setSection={setSection} />
        </div>
      </CarouselWrapper>
    </FlexColumn>
  );
};
