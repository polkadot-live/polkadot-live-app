// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as FA from '@fortawesome/free-solid-svg-icons';
import { useConnections, useEvents } from '@polkadot-live/contexts';
import { getEventChainId } from '@polkadot-live/core';
import { EventGroup, Wrapper } from './Wrappers';
import { Item } from './Item';
import { NoEvents } from './NoEvents';
import {
  ButtonPrimaryInvert,
  ControlsWrapper,
  SortControlButton,
  SortControlLabel,
  TooltipRx,
} from '@polkadot-live/ui';
import { FlexColumn, FlexRow } from '@polkadot-live/styles';
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
  } = useEvents();

  const theme = getTheme();

  return (
    <FlexColumn $rowGap="0.75rem" style={{ paddingBottom: '1rem' }}>
      <FlexRow $gap="0.6rem" style={{ marginBottom: '0.25rem' }}>
        <h2 style={{ fontSize: '1.2rem', paddingBottom: '0.25rem' }}>
          {activeCategory}
        </h2>
      </FlexRow>

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
        <TooltipRx theme={theme} text={'Total'}>
          <span>
            <SortControlLabel
              style={{
                color: 'var(--text-color-secondary)',
                borderColor: 'var(--border-secondary-color)',
                padding: '0.35rem 1.25rem',
                fontSize: '1.06rem',
                fontWeight: 'bold',
              }}
              label={
                activeCategory ? eventCounts[activeCategory].toString() : '0'
              }
            />
          </span>
        </TooltipRx>
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
