// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';

import { getEventChainId } from '@ren/utils/EventUtils';
import { getCategory } from '@polkadot-live/consts/chains';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { EventGroup } from './Wrappers';
import { EventItem } from './EventItem';
import type { EventCategoryProps } from './types';

export const Category = ({ category, events }: EventCategoryProps) => {
  /**
   * Get category's readable name.
   */
  const getCategoryName = (key: string): string =>
    getCategory(key)?.name || 'Unknown Category';

  return (
    <EventGroup>
      <Accordion.Item className="AccordionItem" value={category}>
        <UI.AccordionTrigger narrow={true}>
          <ChevronDownIcon className="AccordionChevron" aria-hidden />
          <UI.TriggerHeader>{getCategoryName(category)}</UI.TriggerHeader>
        </UI.AccordionTrigger>
        <UI.AccordionContent transparent={true}>
          <div className="items-wrapper">
            {events?.map((event) => (
              <EventItem
                key={`${getEventChainId(event)}_${event.uid}`}
                event={event}
              />
            ))}
          </div>
        </UI.AccordionContent>
      </Accordion.Item>
    </EventGroup>
  );
};
