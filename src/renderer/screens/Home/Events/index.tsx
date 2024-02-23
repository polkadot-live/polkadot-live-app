// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEvents } from '@app/contexts/Events';
import React from 'react';
import { Category } from './Category';
import { NoEvents } from './NoEvents';
import { Wrapper } from './Wrappers';
import type { ChainID } from '@/types/chains';
import type { AnyJson } from '@/types/misc';

export const Events = () => {
  const { events, sortChainEvents } = useEvents();

  return (
    <Wrapper>
      {events.size === 0 && <NoEvents />}

      {Array.from(events.entries()).map((entry, i) => {
        const [chainId] = entry;

        // Sort chain events by category and order by timestamp DESC.
        const orderByCategory = sortChainEvents(chainId as ChainID);

        return (
          <React.Fragment key={`${chainId}_events`}>
            {orderByCategory?.map(
              ({ category, events: categoryEvents }: AnyJson) => (
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
