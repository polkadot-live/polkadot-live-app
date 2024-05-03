// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEvents } from '@app/contexts/Events';
import React from 'react';
import { Category } from './Category';
import { NoEvents } from './NoEvents';
import { Wrapper } from './Wrappers';

export const Events = () => {
  const { events, sortAllEvents } = useEvents();

  return (
    <Wrapper>
      {events.size === 0 && <NoEvents />}

      {Array.from(sortAllEvents().entries()).map(
        ([category, categoryEvents]) => (
          <Category
            key={`${category}_events`}
            category={category}
            events={categoryEvents}
          />
        )
      )}
    </Wrapper>
  );
};
