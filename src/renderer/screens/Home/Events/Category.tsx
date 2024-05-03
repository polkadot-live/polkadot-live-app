// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { HeadingWrapper } from '../Wrappers';
import { Item } from './Item';
import { EventGroup } from './Wrappers';
import { getEventChainId } from '@/utils/EventUtils';
import type { EventCategoryProps } from './types';
import type { EventCallback } from '@/types/reporter';
import { faBlock } from '@fortawesome/pro-solid-svg-icons';
import { getCategory } from '@/config/chains';

export const Category = ({ category, events }: EventCategoryProps) => {
  /// Return a unique key for event item.
  const getKey = (event: EventCallback): string =>
    `${getEventChainId(event)}_${event.uid}`;

  /// Get category's readable name.
  const getCategoryName = (key: string): string =>
    getCategory(key)?.name || 'Unknown Category';

  return (
    <EventGroup>
      <HeadingWrapper>
        <div className="flex">
          <div>
            <div className="left">
              <h5>{getCategoryName(category)}</h5>
            </div>
          </div>
        </div>
      </HeadingWrapper>
      <div className="items-wrapper">
        {events?.map((event) => (
          <Item key={getKey(event)} faIcon={faBlock} event={event} />
        ))}
      </div>
    </EventGroup>
  );
};
