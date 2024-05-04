// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
} from '@/renderer/library/Accordion';
import { HeadingWrapper } from '../Wrappers';
import { EventGroup } from './Wrappers';
import { getEventChainId } from '@/utils/EventUtils';
import type { EventCategoryProps } from './types';
import type { EventCallback } from '@/types/reporter';
import {
  faBlock,
  faCaretDown,
  faCaretRight,
} from '@fortawesome/pro-solid-svg-icons';
import { getCategory } from '@/config/chains';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { EventItem } from './EventItem';

export const Category = ({
  category,
  events,
  accordionActiveIndices,
  accordionIndex,
}: EventCategoryProps) => {
  /// Return a unique key for event item.
  const getKey = (event: EventCallback): string =>
    `${getEventChainId(event)}_${event.uid}`;

  /// Get category's readable name.
  const getCategoryName = (key: string): string =>
    getCategory(key)?.name || 'Unknown Category';

  return (
    <EventGroup>
      <AccordionItem>
        <HeadingWrapper>
          <AccordionHeader>
            <div className="flex">
              <div className="left">
                <div className="icon-wrapper">
                  {accordionActiveIndices.includes(accordionIndex) ? (
                    <FontAwesomeIcon
                      icon={faCaretDown}
                      transform={'shrink-1'}
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faCaretRight}
                      transform={'shrink-1'}
                    />
                  )}
                </div>
                <h5>{getCategoryName(category)}</h5>
              </div>
            </div>
          </AccordionHeader>
        </HeadingWrapper>
        <AccordionPanel>
          <div className="items-wrapper">
            {events?.map((event) => (
              <EventItem key={getKey(event)} faIcon={faBlock} event={event} />
            ))}
          </div>
        </AccordionPanel>
      </AccordionItem>
    </EventGroup>
  );
};
