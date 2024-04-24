// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { chainCategory, chainIcon } from '@/config/chains';
import { HeadingWrapper } from '../Wrappers';
import { Item } from './Item';
import { EventGroup } from './Wrappers';
import { getEventChainId } from '@/utils/EventUtils';
import type { EventCategoryProps } from './types';
import type { EventCallback } from '@/types/reporter';

export const Category = ({ chain, category, events }: EventCategoryProps) => {
  const ChainIcon = chainIcon(chain);
  const { name, icon } = chainCategory(chain, category);

  // Return a unique key for event item.
  const getKey = (event: EventCallback): string =>
    `${getEventChainId(event)}_${event.uid}`;

  return (
    <EventGroup>
      <HeadingWrapper>
        <div className="flex">
          <div>
            <div className="left">
              <h5>
                <ChainIcon className="icon" />
                {name}
              </h5>
            </div>
          </div>
        </div>
      </HeadingWrapper>
      <div className="items-wrapper">
        {events?.map((event) => (
          <Item key={getKey(event)} faIcon={icon} event={event} />
        ))}
      </div>
    </EventGroup>
  );
};
