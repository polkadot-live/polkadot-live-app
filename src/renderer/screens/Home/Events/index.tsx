// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEvents } from '@app/contexts/Events';
import { useState, useMemo } from 'react';
import { Category } from './Category';
import { NoEvents } from './NoEvents';
import { Wrapper } from './Wrappers';
import { Accordion } from '@/renderer/library/Accordion';

export const Events = () => {
  const { events, sortAllEvents } = useEvents();

  const sortedEvents = useMemo(() => sortAllEvents(), [events]);

  // Active accordion indices for event categories.
  const [accordionActiveIndices, setAccordionActiveIndices] = useState<
    number[]
  >(
    Array.from(
      { length: Array.from(sortedEvents.keys()).length },
      (_, index) => index
    )
  );

  return (
    <Wrapper style={{ marginTop: '2rem' }}>
      {events.size === 0 && <NoEvents />}

      <Accordion
        multiple
        defaultIndex={accordionActiveIndices}
        setExternalIndices={setAccordionActiveIndices}
      >
        {Array.from(sortedEvents.entries()).map(
          ([category, categoryEvents], i) => (
            <Category
              key={`${category}_events`}
              accordionActiveIndices={accordionActiveIndices}
              accordionIndex={i}
              category={category}
              events={categoryEvents}
            />
          )
        )}
      </Accordion>
    </Wrapper>
  );
};
