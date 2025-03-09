// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as themeVariables from '../../../theme/variables';
import * as UI from '@polkadot-live/ui/components';
import * as Styles from '@polkadot-live/ui/styles';
import { LinksFooter } from '@app/Utils';

import {
  ControlsWrapper,
  SortControlButton,
} from '@polkadot-live/ui/components';
import { ButtonPrimaryInvert } from '@polkadot-live/ui/kits/buttons';
import {
  faCaretLeft,
  faArrowsRotate,
  faEllipsisVertical,
  faCaretRight,
  faEllipsis,
} from '@fortawesome/free-solid-svg-icons';
import { useConnections } from '@app/contexts/common/Connections';
import { useEffect, useState } from 'react';
import { usePolkassembly } from '@app/contexts/openGov/Polkassembly';
import { useReferenda } from '@app/contexts/openGov/Referenda';
import { useTracks } from '@app/contexts/openGov/Tracks';
import { ReferendumRow } from './ReferendumRow';
import { NoteWrapper, PaginationRow, TracksFilterList } from './Wrappers';
import { renderPlaceholders } from '@polkadot-live/ui/utils';
import { useReferendaSubscriptions } from '@app/contexts/openGov/ReferendaSubscriptions';
import { ItemsColumn } from '../../Home/Manage/Wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PuffLoader } from 'react-spinners';
import type { ReferendaProps } from '../types';

export const Referenda = ({ setSection }: ReferendaProps) => {
  const { darkMode, getOnlineMode } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

  const {
    referendaMap,
    fetchingReferenda,
    activeReferendaChainId: chainId,
    getTrackFilter,
    refetchReferenda,
    getReferendaCount,
    getSortedActiveReferenda,
    updateTrackFilter,

    activePage,
    activePageCount,
    activePagedReferenda,
    showPageEllipsis,
    getCurPages,
    setActivePage,
    setRefTrigger,
  } = useReferenda();

  const { fetchingMetadata } = usePolkassembly();
  const { fetchingTracks, getOrderedTracks } = useTracks();
  const { isSubscribedToReferendum, isNotSubscribedToAny } =
    useReferendaSubscriptions();

  // Flag to display referenda with active subscriptions.
  const [onlySubscribed, setOnlySubscribed] = useState(false);
  const [showSubscribedButton] = useState(false);

  // Pagination.
  const onActivePageClick = (val: number) => {
    if (activePage !== val && !fetchingMetadata) {
      setActivePage(val);
    }
  };
  const onPageArrowClick = (dir: 'prev' | 'next') => {
    if (fetchingMetadata) {
      return;
    } else if (dir === 'prev') {
      setActivePage((pv) => (pv > 1 ? pv - 1 : pv));
    } else {
      setActivePage((pv) => (pv < activePageCount ? pv + 1 : pv));
    }
  };

  // Get subscribed referenda only.
  const getSubscribedReferenda = () =>
    referendaMap.has(chainId)
      ? referendaMap
          .get(chainId)!
          .filter((r) => isSubscribedToReferendum(chainId, r))
      : [];

  // Reset filter and tracks container when another chain is selected.
  useEffect(() => {
    updateTrackFilter(null);

    // Reset tracks container scroll value.
    const container = document.getElementById('TracksContainer');
    if (container) {
      container.scrollLeft = 0;
    }
  }, [chainId]);

  // Re-fetch referenda when user clicks refresh button.
  const handleRefetchReferenda = () => {
    refetchReferenda();
  };

  // Render referenda as single list.
  const renderListed = () => (
    <>
      <PaginationRow>
        <button
          className={`btn ${activePage === 1 && 'disable'} ${fetchingMetadata && 'fetching'}`}
          disabled={activePage === 1}
          onClick={() => onPageArrowClick('prev')}
        >
          <FontAwesomeIcon icon={faCaretLeft} />
        </button>
        {getCurPages().map((i, j) => (
          <Styles.FlexRow key={i} $row={'0.75rem'}>
            {j === 2 && !showPageEllipsis() && activePageCount > 4 && (
              <button className={`btn placeholder`}>
                <FontAwesomeIcon className="icon" icon={faEllipsis} />
              </button>
            )}
            <button
              onClick={() => onActivePageClick(i)}
              className={`btn ${activePage === i && 'selected'} ${fetchingMetadata && 'fetching'}
              ${j === 2 && getCurPages().length === 5 && 'middle'}`}
            >
              {i}
            </button>
          </Styles.FlexRow>
        ))}
        <button
          className={`btn ${activePage === activePageCount && 'disable'} ${fetchingMetadata && 'fetching'}`}
          disabled={activePage === activePageCount}
          onClick={() => onPageArrowClick('next')}
        >
          <FontAwesomeIcon icon={faCaretRight} />
        </button>

        {fetchingMetadata && (
          <PuffLoader size={20} color={'var(--text-color-primary)'} />
        )}
      </PaginationRow>

      <ItemsColumn>
        {activePagedReferenda.map((referendum, i) => (
          <ReferendumRow
            key={`${i}_${referendum.refId}`}
            referendum={referendum}
            index={i}
          />
        ))}
      </ItemsColumn>
    </>
  );

  // Render subscribed referenda as a single list.
  const renderSubscribedListed = () =>
    isNotSubscribedToAny(chainId) ? (
      <div>
        <p>You have not subscribed to any referenda.</p>
      </div>
    ) : (
      <ItemsColumn>
        {getSortedActiveReferenda(true, getSubscribedReferenda()).map(
          (referendum, i) => (
            <ReferendumRow
              key={`${i}_${referendum.refId}_subscribed`}
              referendum={referendum}
              index={i}
            />
          )
        )}
      </ItemsColumn>
    );

  // Handle clicking only subscribed button.
  const handleToggleOnlySubscribed = () => {
    setOnlySubscribed(!onlySubscribed);
  };

  // Handle track click.
  const onTrackClick = (trackId: string | null) => {
    if (trackId === null || getReferendaCount(trackId) > 0) {
      setActivePage(1);
      setRefTrigger(true);
      updateTrackFilter(trackId);
    }
  };

  // Calculate track filter class.
  const getTrackClass = (trackId: string | null) => {
    const cur = getTrackFilter();
    if (trackId === null) {
      return cur === trackId ? 'selected' : '';
    } else {
      return getReferendaCount(trackId) === 0
        ? 'disable'
        : cur === trackId
          ? 'selected'
          : '';
    }
  };

  return (
    <UI.ScrollableMax>
      <Styles.PadWrapper>
        <Styles.FlexColumn $rowGap={'1.5rem'}>
          <section>
            <Styles.FlexColumn>
              <UI.ActionItem showIcon={false} text={`${chainId} Referenda`} />
              {/* Sorting controls */}
              <ControlsWrapper className="ReferendaControls" $padBottom={true}>
                <ButtonPrimaryInvert
                  disabled={fetchingReferenda}
                  className="back-btn"
                  text="Back"
                  iconLeft={faCaretLeft}
                  onClick={() => setSection(0)}
                  style={{
                    color:
                      chainId === 'Polkadot'
                        ? 'rgb(169, 74, 117)'
                        : 'rgb(133, 113, 177)',
                    borderColor:
                      chainId === 'Polkadot'
                        ? 'rgb(169, 74, 117)'
                        : 'rgb(133, 113, 177)',
                  }}
                />
                <UI.TooltipRx
                  theme={theme}
                  text={
                    getOnlineMode() ? 'Refresh Referenda' : 'Currently Offline'
                  }
                >
                  <span>
                    <SortControlButton
                      isActive={true}
                      isDisabled={fetchingReferenda || !getOnlineMode()}
                      onClick={() => handleRefetchReferenda()}
                      faIcon={faArrowsRotate}
                      fixedWidth={false}
                      respClass="ReferendaControls"
                    />
                  </span>
                </UI.TooltipRx>
                {showSubscribedButton && (
                  <UI.TooltipRx theme={theme} text={'Show Subscribed'}>
                    <span>
                      <SortControlButton
                        isActive={onlySubscribed}
                        isDisabled={fetchingReferenda}
                        faIcon={faEllipsisVertical}
                        onClick={() => handleToggleOnlySubscribed()}
                        fixedWidth={false}
                        respClass="ReferendaControls"
                      />
                    </span>
                  </UI.TooltipRx>
                )}
              </ControlsWrapper>
            </Styles.FlexColumn>
          </section>

          <section>
            <Styles.FlexColumn>
              {/* Only Subscribed Notice */}
              {onlySubscribed && (
                <NoteWrapper>
                  <Styles.FlexRow>
                    <span>Note:</span>
                    <p>
                      You are viewing only referenda that you are subscribed to.
                    </p>
                  </Styles.FlexRow>
                </NoteWrapper>
              )}

              {/* List referenda */}
              {!getOnlineMode() && !referendaMap.has(chainId) ? (
                <div style={{ padding: '0.5rem' }}>
                  <p>Currently offline.</p>
                  <p>Please reconnect to load OpenGov referenda.</p>
                </div>
              ) : (
                <div>
                  {fetchingReferenda || fetchingTracks ? (
                    <>{renderPlaceholders(4)}</>
                  ) : (
                    <Styles.FlexColumn>
                      <section>
                        <Styles.FlexRow>
                          <TracksFilterList id="TracksContainer">
                            <Styles.FlexRow
                              role="button"
                              onClick={() => onTrackClick(null)}
                              className="container"
                              $gap={'0.75rem'}
                            >
                              <p className={getTrackClass(null)} role="button">
                                All
                              </p>
                              <span>{getReferendaCount(null)}</span>
                            </Styles.FlexRow>
                            {getOrderedTracks(chainId).map((t) => (
                              <Styles.FlexRow
                                $gap={'0.6rem'}
                                role="button"
                                onClick={() => onTrackClick(String(t.trackId))}
                                className="container"
                                key={t.trackName}
                              >
                                <p className={getTrackClass(String(t.trackId))}>
                                  {t.label}
                                </p>
                                <span>
                                  {getReferendaCount(String(t.trackId))}
                                </span>
                              </Styles.FlexRow>
                            ))}
                          </TracksFilterList>
                        </Styles.FlexRow>
                      </section>

                      {!onlySubscribed && renderListed()}
                      {onlySubscribed && renderSubscribedListed()}
                    </Styles.FlexColumn>
                  )}
                </div>
              )}
            </Styles.FlexColumn>
          </section>
        </Styles.FlexColumn>
      </Styles.PadWrapper>
      <LinksFooter />
    </UI.ScrollableMax>
  );
};
