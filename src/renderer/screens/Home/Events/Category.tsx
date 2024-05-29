// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AccordionItem, AccordionPanel } from '@/renderer/library/Accordion';
import { EventGroup } from './Wrappers';
import { getEventChainId } from '@/utils/EventUtils';
import { faBlock } from '@fortawesome/pro-solid-svg-icons';
import { getCategory } from '@/config/chains';
import { EventItem } from './EventItem';
import { AccordionCaretHeader } from '@/renderer/library/Accordion/AccordionCaretHeaders';
import type { EventCategoryProps } from './types';

export const Category = ({
  category,
  events,
  accordionIndex,
}: EventCategoryProps) => {
  /// Get category's readable name.
  const getCategoryName = (key: string): string =>
    getCategory(key)?.name || 'Unknown Category';

  return (
    <EventGroup>
      <AccordionItem>
        <AccordionCaretHeader
          title={getCategoryName(category)}
          itemIndex={accordionIndex}
          wide={true}
        />
        <AccordionPanel>
          <div className="items-wrapper">
            {events?.map((event) => (
              <EventItem
                key={`${getEventChainId(event)}_${event.uid}`}
                faIcon={faBlock}
                event={event}
              />
            ))}
          </div>
        </AccordionPanel>
      </AccordionItem>
    </EventGroup>
  );
};
