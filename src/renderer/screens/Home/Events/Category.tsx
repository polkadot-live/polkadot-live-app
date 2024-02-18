// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { chainCategory, chainIcon } from '@/config/chains';
import { HeadingWrapper } from '../Wrappers';
import { Item } from './Item';
import { EventGroup } from './Wrappers';
import type { EventCategoryProps } from './types';

export const Category = ({
  chain,
  category,
  events,
  i,
}: EventCategoryProps) => {
  const ChainIcon = chainIcon(chain);
  const { name, icon } = chainCategory(chain, category);

  return (
    <EventGroup style={i === 0 ? { marginTop: '1.7rem' } : undefined}>
      <HeadingWrapper>
        <h5>
          <ChainIcon className="icon" />
          {name}
        </h5>
      </HeadingWrapper>
      {events?.map((event, j) => (
        <Item
          key={`${chain}_cat_event_${event.timestamp}`}
          chain={chain}
          categoryKey={i}
          eventKey={j}
          faIcon={icon}
          {...event}
        />
      ))}
    </EventGroup>
  );
};
