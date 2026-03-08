// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as FA from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useConnections, useEvents } from '@polkadot-live/contexts';
import { getEventChainId } from '@polkadot-live/core';
import { FlexColumn } from '@polkadot-live/styles';
import {
  ButtonPrimaryInvert,
  ControlsWrapper,
  SortControlButton,
  TooltipRx,
} from '@polkadot-live/ui';
import { categoryColors } from '../Wrappers';
import { IconCircle } from './Category/Wrappers';
import { Item } from './Item';
import { NoEvents } from './NoEvents';
import { EventGroup, HeaderRow, TotalBadge, Wrapper } from './Wrappers';
import type { EventsListProps } from './types';

export const EventsList = ({ setSection }: EventsListProps) => {
  const { getTheme } = useConnections();
  const {
    activeCategory,
    eventCounts,
    hasMore,
    loadMoreRef,
    sortDesc,
    getSortedEvents,
    setClearDialogOpen,
    setSortDesc,
    getEventCategoryIcon,
  } = useEvents();

  const theme = getTheme();
  const total = activeCategory ? (eventCounts[activeCategory] ?? 0) : 0;

  return (
    <FlexColumn $rowGap="0.6rem">
      {/* Controls */}
      <ControlsWrapper>
        <ButtonPrimaryInvert
          className="back-btn"
          text="Back"
          iconLeft={FA.faCaretLeft}
          onClick={() => {
            setSortDesc(true);
            setSection(0);
          }}
        />
        <TooltipRx
          theme={theme}
          text={sortDesc ? 'Oldest First' : 'Newest First'}
        >
          <span>
            <SortControlButton
              fixedWidth={false}
              isActive={sortDesc}
              isDisabled={false}
              faIcon={FA.faSort}
              onClick={() => setSortDesc(!sortDesc)}
            />
          </span>
        </TooltipRx>
        <TooltipRx theme={theme} text={'Clear All'}>
          <span>
            <SortControlButton
              fixedWidth={false}
              isActive={true}
              isDisabled={
                activeCategory ? eventCounts[activeCategory] === 0 : false
              }
              faIcon={FA.faEraser}
              onClick={() => setClearDialogOpen(true)}
            />
          </span>
        </TooltipRx>
      </ControlsWrapper>

      <HeaderRow $gap="0.6rem">
        {activeCategory && (
          <IconCircle $color={categoryColors[activeCategory]}>
            <FontAwesomeIcon icon={getEventCategoryIcon(activeCategory)} />
          </IconCircle>
        )}
        <FlexColumn style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.1rem' }}>{activeCategory}</h2>
        </FlexColumn>
        <TotalBadge>
          <span className="value">{total}</span>
          <span className="label">Total</span>
        </TotalBadge>
      </HeaderRow>

      {/* Events */}
      <Wrapper>
        {getSortedEvents().length === 0 && <NoEvents />}

        <div style={{ display: 'block', width: '100%' }}>
          <EventGroup>
            <div className="items-wrapper">
              {getSortedEvents(sortDesc).map((event) => (
                <Item
                  key={`${getEventChainId(event)}_${event.uid}`}
                  event={event}
                />
              ))}
            </div>
            {hasMore && <div ref={loadMoreRef} />}
          </EventGroup>
        </div>
      </Wrapper>
    </FlexColumn>
  );
};
