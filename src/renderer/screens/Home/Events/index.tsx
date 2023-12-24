// Copyright 2023 @paritytech/polkadot-live authors & contributors
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
      {Object.keys(events)?.length ? (
        Object.keys(events)?.map((chain: string, i) => {
          // Sort chain events by category and order by timestamp DESC.
          const orderByCategory = sortChainEvents(chain as ChainID);

          return (
            <React.Fragment key={`${chain}_events`}>
              {orderByCategory?.map(
                ({ category, events: categoryEvents }: AnyJson) => (
                  <Category
                    key={`${chain}_${category}_events`}
                    chain={chain as ChainID}
                    category={category}
                    events={categoryEvents}
                    i={i}
                  />
                )
              )}
            </React.Fragment>
          );
        })
      ) : (
        <NoEvents />
      )}
    </Wrapper>
  );
};
