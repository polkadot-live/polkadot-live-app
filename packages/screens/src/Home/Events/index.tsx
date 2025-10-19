// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Accordion from '@radix-ui/react-accordion';
import * as UI from '@polkadot-live/ui/components';
import { useContextProxy } from '@polkadot-live/contexts';
import { useState, useMemo } from 'react';
import { Category } from './Category';
import { NoEvents } from './NoEvents';
import { EventGroup, Wrapper } from './Wrappers';
import { faSort, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { EventItem } from './EventItem';
import { getEventChainId } from '@polkadot-live/core';
import {
  MainHeading,
  ControlsWrapper,
  SortControlButton,
} from '@polkadot-live/ui/components';
import { FlexColumn } from '@polkadot-live/styles/wrappers';

export const Events = () => {
  const { useCtx } = useContextProxy();
  const { events, sortAllGroupedEvents, sortAllEvents } = useCtx('EventsCtx')();

  /// State for sorting controls.
  const [newestFirst, setNewestFirst] = useState(true);
  const [groupingOn, setGroupingOn] = useState(true);

  const sortedGroupedEvents = useMemo(
    () => sortAllGroupedEvents(newestFirst),
    [events, newestFirst]
  );

  const sortedEvents = useMemo(
    () => sortAllEvents(newestFirst),
    [events, newestFirst]
  );

  /// Accordion state.
  const [accordionValue, setAccordionValue] = useState<string[]>([
    ...sortedGroupedEvents.keys(),
  ]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: '0.75rem',
        padding: '2rem 1rem 1rem',
      }}
    >
      <MainHeading>Events</MainHeading>

      {/* Sorting controls */}
      <ControlsWrapper $padBottom={!groupingOn}>
        <SortControlButton
          isActive={newestFirst}
          isDisabled={false}
          faIcon={faSort}
          onClick={() => setNewestFirst(!newestFirst)}
          onLabel="Newest First"
          offLabel="Oldest First"
        />
        <SortControlButton
          isActive={groupingOn}
          isDisabled={false}
          faIcon={faLayerGroup}
          onClick={() => setGroupingOn(!groupingOn)}
          onLabel="Grouping"
          offLabel="Grouping"
          fixedWidth={false}
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
          <UI.AccordionWrapper style={{ marginTop: '1rem' }}>
            <Accordion.Root
              className="AccordionRoot"
              type="multiple"
              value={accordionValue}
              onValueChange={(val) => setAccordionValue(val as string[])}
            >
              <FlexColumn>
                {Array.from(sortedGroupedEvents.entries()).map(
                  ([category, categoryEvents]) => (
                    <Category
                      key={`${category}_events`}
                      category={category}
                      events={categoryEvents}
                    />
                  )
                )}
              </FlexColumn>
            </Accordion.Root>
          </UI.AccordionWrapper>
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
    </div>
  );
};
