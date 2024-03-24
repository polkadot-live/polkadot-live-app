// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEvents } from '@app/contexts/Events';
import React from 'react';
import { Category } from './Category';
import { NoEvents } from './NoEvents';
import { Wrapper } from './Wrappers';
import type { ChainID } from '@/types/chains';

export const Events = () => {
  const { eventsRef, sortChainEvents } = useEvents();

  return (
    <Wrapper>
      {eventsRef.current.size === 0 && <NoEvents />}

      {Array.from(eventsRef.current.keys()).map((chainId, i) => {
        // Sort chain events by category and order by timestamp DESC.
        const sortedEvents = sortChainEvents(chainId as ChainID);

        return (
          <React.Fragment key={`${chainId}_events`}>
            {Array.from(sortedEvents.entries()).map(
              ([category, categoryEvents]) => (
                <Category
                  key={`${chainId}_${category}_events`}
                  chain={chainId as ChainID}
                  category={category}
                  events={categoryEvents}
                  i={i}
                />
              )
            )}
          </React.Fragment>
        );
      })}
    </Wrapper>
  );
};
