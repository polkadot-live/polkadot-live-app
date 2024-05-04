// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEvents } from '@app/contexts/Events';
import { useState, useMemo } from 'react';
import { Category } from './Category';
import { NoEvents } from './NoEvents';
import { EventGroup, SortControlsWrapper, Wrapper } from './Wrappers';
import { Accordion } from '@/renderer/library/Accordion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimer,
  faLayerGroup,
  faBlock,
} from '@fortawesome/pro-solid-svg-icons';
import { EventItem } from './EventItem';
import { getEventChainId } from '@/utils/EventUtils';

export const Events = () => {
  /// State for sorting controls.
  const [newestFirst, setNewestFirst] = useState(true);
  const [groupingOn, setGroupingOn] = useState(true);

  /// Get events state.
  const { events, sortAllGroupedEvents, sortAllEvents } = useEvents();

  /// Memoize sorted event data.
  const sortedGroupedEvents = useMemo(
    () => sortAllGroupedEvents(newestFirst),
    [events, newestFirst]
  );

  const sortedEvents = useMemo(
    () => sortAllEvents(newestFirst),
    [events, newestFirst]
  );

  /// Active accordion indices for event categories.
  const [accordionActiveIndices, setAccordionActiveIndices] = useState<
    number[]
  >(
    Array.from(
      { length: Array.from(sortedGroupedEvents.keys()).length },
      (_, index) => index
    )
  );

  return (
    <>
      <SortControlsWrapper>
        <div className="controls-wrapper">
          {/* Date Sort Button */}
          <div
            className={newestFirst ? 'icon-wrapper active' : 'icon-wrapper'}
            onClick={() => setNewestFirst(!newestFirst)}
          >
            <div className="icon">
              <FontAwesomeIcon icon={faTimer} />
            </div>
            <span>{newestFirst ? 'Newest First' : 'Oldest First'}</span>
          </div>
          {/* Grouping Button */}
          <div
            className={groupingOn ? 'icon-wrapper active' : 'icon-wrapper'}
            onClick={() => setGroupingOn(!groupingOn)}
          >
            <div className="icon">
              <FontAwesomeIcon icon={faLayerGroup} transform={'grow-1'} />
            </div>
            <span>{groupingOn ? 'Grouping On' : 'Grouping Off'}</span>
          </div>
        </div>
      </SortControlsWrapper>

      <Wrapper style={{ margin: '1rem 0' }}>
        {events.size === 0 && <NoEvents />}

        <div style={groupingOn ? { display: 'block' } : { display: 'none' }}>
          <Accordion
            multiple
            defaultIndex={accordionActiveIndices}
            setExternalIndices={setAccordionActiveIndices}
          >
            {Array.from(sortedGroupedEvents.entries()).map(
              ([category, categoryEvents], i) => (
                <Category
                  key={`${category}_events`}
                  accordionActiveIndices={accordionActiveIndices}
                  accordionIndex={i}
                  category={category}
                  events={categoryEvents}
                />
              )
            )}
          </Accordion>
        </div>
        <div style={groupingOn ? { display: 'none' } : { display: 'block' }}>
          <EventGroup>
            <div className="items-wrapper">
              {sortedEvents.map((event) => (
                <EventItem
                  key={`${getEventChainId(event)}_${event.uid}`}
                  faIcon={faBlock}
                  event={event}
                />
              ))}
            </div>
          </EventGroup>
        </div>
      </Wrapper>
    </>
  );
};
