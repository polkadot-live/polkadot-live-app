// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEvents } from '@/renderer/contexts/main/Events';
import { useState, useMemo } from 'react';
import { Category } from './Category';
import { NoEvents } from './NoEvents';
import { EventGroup, Wrapper } from './Wrappers';
import { Accordion } from '@/renderer/library/Accordion';
import { faTimer, faLayerGroup } from '@fortawesome/pro-solid-svg-icons';
import { EventItem } from './EventItem';
import { getEventChainId } from '@/utils/EventUtils';
import { ControlsWrapper, SortControlButton } from '@/renderer/utils/common';

export const Events = () => {
  /// State for sorting controls.
  const [newestFirst, setNewestFirst] = useState(true);
  const [groupingOn, setGroupingOn] = useState(true);

  /// Get events state.
  const { events, sortAllGroupedEvents, sortAllEvents } = useEvents();

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
      {/* Sorting controls */}
      <ControlsWrapper $padWrapper={true} $padBottom={!groupingOn}>
        <SortControlButton
          isActive={newestFirst}
          isDisabled={false}
          faIcon={faTimer}
          onClick={() => setNewestFirst(!newestFirst)}
          onLabel="Newest First"
          offLabel="Oldest First"
        />
        <SortControlButton
          isActive={groupingOn}
          isDisabled={false}
          faIcon={faLayerGroup}
          onClick={() => setGroupingOn(!groupingOn)}
          onLabel="Grouping On"
          offLabel="Grouping Off"
        />
      </ControlsWrapper>

      {/* List Events */}
      <Wrapper>
        {events.size === 0 && <NoEvents />}

        <div
          style={
            groupingOn
              ? { display: 'block', width: '100%' }
              : { display: 'none', width: '100%' }
          }
        >
          <Accordion
            multiple
            defaultIndex={accordionActiveIndices}
            setExternalIndices={setAccordionActiveIndices}
          >
            {Array.from(sortedGroupedEvents.entries()).map(
              ([category, categoryEvents], i) => (
                <Category
                  key={`${category}_events`}
                  accordionIndex={i}
                  category={category}
                  events={categoryEvents}
                />
              )
            )}
          </Accordion>
        </div>
        <div
          style={
            groupingOn
              ? { display: 'none', width: '100%' }
              : { display: 'block', width: '100%' }
          }
        >
          <EventGroup>
            <div className="items-wrapper">
              {sortedEvents.map((event) => (
                <EventItem
                  key={`${getEventChainId(event)}_${event.uid}`}
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
