// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as themeVariables from '../../../theme/variables';
import * as UI from '@polkadot-live/ui/components';
import * as Styles from '@polkadot-live/ui/styles';
import * as Tabs from '@radix-ui/react-tabs';
import * as Wrappers from './Wrappers';
import { HistoryRow } from './HistoryRow';
import { DropdownReferendaFilter } from '../Dropdowns';

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
import { useConnections, useHelp } from '@ren/contexts/common';
import { useEffect, useState } from 'react';
import {
  usePolkassembly,
  useReferenda,
  useReferendaSubscriptions,
  useTracks,
} from '@ren/contexts/openGov';
import { ReferendumRow } from './ReferendumRow';
import { renderPlaceholders } from '@polkadot-live/ui/utils';
import { ItemsColumn } from '../../Home/Manage/Wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PuffLoader } from 'react-spinners';
import { DialogFindReferendum } from './Dialogs';
import type { ReferendaProps } from '../types';

export const Referenda = ({ setSection }: ReferendaProps) => {
  const { darkMode, getOnlineMode } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

  const {
    activePagedReferenda,
    activeReferendaChainId: chainId,
    fetchingReferenda,
    historyPagedReferenda,
    referendaMap,
    tabVal,
    getActiveReferenda,
    getPageNumbers,
    getReferendaCount,
    getTrackFilter,
    refetchReferenda,
    setPage,
    setRefTrigger,
    setTabVal,
    showPageEllipsis,
    updateTrackFilter,
  } = useReferenda();

  const { openHelp } = useHelp();
  const { fetchingMetadata } = usePolkassembly();
  const { fetchingTracks, getOrderedTracks } = useTracks();
  const { isSubscribedToReferendum, isNotSubscribedToAny } =
    useReferendaSubscriptions();

  // Flag to display referenda with active subscriptions.
  const [onlySubscribed, setOnlySubscribed] = useState(false);
  const [showSubscribedButton] = useState(false);

  const { page: activePage, pageCount: activePageCount } = activePagedReferenda;
  const { page: historyPage, pageCount: historyPageCount } =
    historyPagedReferenda;

  // Pagination.
  const onPageClick = (tab: 'active' | 'history', val: number) => {
    switch (tab) {
      case 'active': {
        if (activePagedReferenda.page !== val && !fetchingMetadata) {
          setPage(val, tab);
        }
        break;
      }
      case 'history': {
        if (historyPagedReferenda.page !== val && !fetchingMetadata) {
          setPage(val, tab);
        }
        break;
      }
    }
  };

  // Update page state when a pagination arrow is clicked.
  const onPageArrowClick = (
    tab: 'active' | 'history',
    dir: 'prev' | 'next'
  ) => {
    if (fetchingMetadata) {
      return;
    }

    const { page, pageCount } =
      tab === 'active' ? activePagedReferenda : historyPagedReferenda;

    dir === 'prev'
      ? setPage(page > 1 ? page - 1 : page, tab)
      : setPage(page < pageCount ? page + 1 : page, tab);
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
  const renderListed = (tab: 'active' | 'history') => {
    const curPage = tab === 'active' ? activePage : historyPage;
    const pageCount = tab === 'active' ? activePageCount : historyPageCount;

    const referenda =
      tab === 'active'
        ? activePagedReferenda.referenda
        : historyPagedReferenda.referenda;

    return (
      <Styles.FlexColumn style={{ marginTop: '1rem' }}>
        <Wrappers.PaginationRow>
          <Styles.FlexRow $gap={'0.75rem'} style={{ flex: 1 }}>
            <button
              className={`btn ${curPage === 1 && 'disable'} ${fetchingMetadata && 'fetching'}`}
              disabled={curPage === 1}
              onClick={() => onPageArrowClick(tab, 'prev')}
            >
              <FontAwesomeIcon icon={faCaretLeft} />
            </button>
            {getPageNumbers(tab).map((i, j) => (
              <Styles.FlexRow key={i} $gap={'0.75rem'}>
                {j === 2 && !showPageEllipsis(tab) && pageCount > 4 && (
                  <button className="btn placeholder">
                    <FontAwesomeIcon className="icon" icon={faEllipsis} />
                  </button>
                )}
                <button
                  onClick={() => onPageClick(tab, i)}
                  className={`btn ${curPage === i && 'selected'} ${fetchingMetadata && 'fetching'}
              ${j === 2 && getPageNumbers(tab).length === 5 && 'middle'}`}
                >
                  {i}
                </button>
              </Styles.FlexRow>
            ))}
            <button
              className={`btn ${curPage === pageCount && 'disable'} ${fetchingMetadata && 'fetching'}`}
              disabled={curPage === pageCount}
              onClick={() => onPageArrowClick(tab, 'next')}
            >
              <FontAwesomeIcon icon={faCaretRight} />
            </button>

            {/* Loading Spinner */}
            {fetchingMetadata && (
              <PuffLoader size={20} color={'var(--text-color-primary)'} />
            )}
          </Styles.FlexRow>

          {/* Find and Filter */}
          <Styles.FlexRow $gap={'0.75rem'}>
            <DialogFindReferendum tab={tab} />
            <DropdownReferendaFilter tab={tab} />
          </Styles.FlexRow>
        </Wrappers.PaginationRow>

        {referenda.length === 0 ? (
          <Styles.EmptyWrapper>
            <div>
              <p>No referenda match the filters.</p>
            </div>
          </Styles.EmptyWrapper>
        ) : (
          <ItemsColumn>
            {tab === 'active' &&
              referenda.map((referendum, i) => (
                <ReferendumRow
                  key={`${i}_${referendum.refId}`}
                  referendum={referendum}
                  index={i}
                />
              ))}
            {tab === 'history' &&
              referenda.map((referendum, i) => (
                <HistoryRow
                  key={`${i}_${referendum.refId}`}
                  info={referendum}
                />
              ))}
          </ItemsColumn>
        )}
      </Styles.FlexColumn>
    );
  };

  // Render subscribed referenda as a single list.
  const renderSubscribedListed = () =>
    isNotSubscribedToAny(chainId) ? (
      <div>
        <p>You have not subscribed to any referenda.</p>
      </div>
    ) : (
      <ItemsColumn>
        {getActiveReferenda(getSubscribedReferenda()).map((referendum, i) => (
          <ReferendumRow
            key={`${i}_${referendum.refId}_subscribed`}
            referendum={referendum}
            index={i}
          />
        ))}
      </ItemsColumn>
    );

  // Handle clicking only subscribed button.
  const handleToggleOnlySubscribed = () => {
    setOnlySubscribed(!onlySubscribed);
  };

  // Handle track click.
  const onTrackClick = (trackId: string | null) => {
    if (trackId === null || getReferendaCount(trackId) > 0) {
      setPage(1, 'active');
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
                <Wrappers.NoteWrapper>
                  <Styles.FlexRow>
                    <span>Note:</span>
                    <p>
                      You are viewing only referenda that you are subscribed to.
                    </p>
                  </Styles.FlexRow>
                </Wrappers.NoteWrapper>
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
                    <Wrappers.TabsRoot
                      className="TabsRoot"
                      value={tabVal}
                      onValueChange={(val) =>
                        setTabVal(val as 'active' | 'history')
                      }
                    >
                      <Tabs.List
                        className="TabsList"
                        aria-label="Manage your account"
                      >
                        <Tabs.Trigger className="TabsTrigger" value="active">
                          Active Referenda
                        </Tabs.Trigger>
                        <Tabs.Trigger className="TabsTrigger" value="history">
                          History
                        </Tabs.Trigger>
                      </Tabs.List>
                      <Tabs.Content className="TabsContent" value="active">
                        <Styles.FlexColumn>
                          <section>
                            <Styles.FlexRow>
                              <Wrappers.TracksFilterList
                                $chainId={chainId}
                                id="TracksContainer"
                              >
                                <Styles.FlexRow
                                  role="button"
                                  onClick={() => onTrackClick(null)}
                                  className="container"
                                  $gap={'0.75rem'}
                                >
                                  <p
                                    className={getTrackClass(null)}
                                    role="button"
                                  >
                                    All
                                  </p>
                                  <span>{getReferendaCount(null)}</span>
                                </Styles.FlexRow>
                                {getOrderedTracks(chainId).map((t) => (
                                  <Styles.FlexRow
                                    $gap={'0.6rem'}
                                    role="button"
                                    onClick={() =>
                                      onTrackClick(String(t.trackId))
                                    }
                                    className="container"
                                    key={t.trackName}
                                  >
                                    <p
                                      className={getTrackClass(
                                        String(t.trackId)
                                      )}
                                    >
                                      {t.label}
                                    </p>
                                    <span>
                                      {getReferendaCount(String(t.trackId))}
                                    </span>
                                  </Styles.FlexRow>
                                ))}
                              </Wrappers.TracksFilterList>
                            </Styles.FlexRow>
                          </section>
                        </Styles.FlexColumn>

                        {!onlySubscribed && renderListed('active')}
                        {onlySubscribed && renderSubscribedListed()}
                      </Tabs.Content>
                      <Tabs.Content className="TabsContent" value="history">
                        {renderListed('history')}
                      </Tabs.Content>
                    </Wrappers.TabsRoot>
                  )}
                </div>
              )}
            </Styles.FlexColumn>
          </section>
        </Styles.FlexColumn>
      </Styles.PadWrapper>
      <UI.LinksFooter openHelp={openHelp} />
    </UI.ScrollableMax>
  );
};
