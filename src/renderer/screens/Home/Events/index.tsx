// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEvents } from '@app/contexts/Events';
import { useState, useMemo } from 'react';
import { Category } from './Category';
import { NoEvents } from './NoEvents';
import { SortControlsWrapper, Wrapper } from './Wrappers';
import { Accordion } from '@/renderer/library/Accordion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimer, faLayerGroup } from '@fortawesome/pro-solid-svg-icons';

export const Events = () => {
  /// State for sorting controls.
  const [newestFirst, setNewestFirst] = useState(true);
  const [groupingOn, setGroupingOn] = useState(true);

  const { events, sortAllEvents } = useEvents();
  const sortedEvents = useMemo(
    () => sortAllEvents(newestFirst),
    [events, newestFirst, groupingOn]
  );

  /// Active accordion indices for event categories.
  const [accordionActiveIndices, setAccordionActiveIndices] = useState<
    number[]
  >(
    Array.from(
      { length: Array.from(sortedEvents.keys()).length },
      (_, index) => index
    )
  );

  return (
    <>
      <SortControlsWrapper>
        <div className="controls-wrapper">
          {/* Date Sort Button */}
          <div
            className="icon-wrapper"
            onClick={() => setNewestFirst(!newestFirst)}
          >
            <div className="icon">
              <FontAwesomeIcon icon={faTimer} />
            </div>
            <span>{newestFirst ? 'Newest First' : 'Oldest First'}</span>
          </div>
          {/* Grouping Button */}
          <div
            className="icon-wrapper"
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

        <Accordion
          multiple
          defaultIndex={accordionActiveIndices}
          setExternalIndices={setAccordionActiveIndices}
        >
          {Array.from(sortedEvents.entries()).map(
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
      </Wrapper>
    </>
  );
};
