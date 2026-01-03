// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui';
import * as Styles from '@polkadot-live/styles/wrappers';
import * as Tabs from '@radix-ui/react-tabs';
import * as Wrappers from './Wrappers';
import {
  faCaretLeft,
  faArrowsRotate,
  faCaretRight,
  faEllipsis,
} from '@fortawesome/free-solid-svg-icons';
import {
  useConnections,
  useHelp,
  useReferenda,
  useTracks,
} from '@polkadot-live/contexts';
import { useEffect } from 'react';
import { ReferendumRow } from './ReferendumRow';
import { DropdownReferendaFilter } from '../Dropdowns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { HistoryRow } from './HistoryRow';
import { PuffLoader } from 'react-spinners';
import { DialogFindReferendum } from './Dialogs';
import type { ReferendaProps } from '../types';

export const Referenda = ({ setSection }: ReferendaProps) => {
  const { getTheme, getOnlineMode } = useConnections();
  const theme = getTheme();

  const {
    activePagedReferenda,
    activeReferendaChainId: chainId,
    fetchingReferenda,
    historyPagedReferenda,
    referendaMap,
    tabVal,
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
  const { getOrderedTracks } = useTracks();

  const { page: activePage, pageCount: activePageCount } = activePagedReferenda;
  const { page: historyPage, pageCount: historyPageCount } =
    historyPagedReferenda;

  // Pagination.
  const onPageClick = (tab: 'active' | 'history', val: number) => {
    switch (tab) {
      case 'active': {
        if (activePagedReferenda.page !== val) {
          setPage(val, tab);
        }
        break;
      }
      case 'history': {
        if (historyPagedReferenda.page !== val) {
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
    const { page, pageCount } =
      tab === 'active' ? activePagedReferenda : historyPagedReferenda;

    dir === 'prev'
      ? setPage(page > 1 ? page - 1 : page, tab)
      : setPage(page < pageCount ? page + 1 : page, tab);
  };

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
        <Styles.PaginationRow>
          <Styles.FlexRow $gap={'0.75rem'} style={{ flex: 1 }}>
            <button
              className="btn"
              disabled={curPage === 1 || referenda.length === 0}
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
                  className={`btn ${curPage === i && 'selected'}
              ${j === 2 && getPageNumbers(tab).length === 5 && 'middle'}`}
                >
                  {i}
                </button>
              </Styles.FlexRow>
            ))}
            <button
              className="btn"
              disabled={curPage === pageCount || referenda.length === 0}
              onClick={() => onPageArrowClick(tab, 'next')}
            >
              <FontAwesomeIcon icon={faCaretRight} />
            </button>
          </Styles.FlexRow>

          {/* Find and Filter */}
          <Styles.FlexRow $gap={'0.75rem'}>
            <DialogFindReferendum tab={tab} />
            <DropdownReferendaFilter tab={tab} />
          </Styles.FlexRow>
        </Styles.PaginationRow>

        {fetchingReferenda && (
          <Styles.EmptyWrapper>
            <PuffLoader size={20} color={'var(--text-color-primary)'} />
            <div style={{ paddingLeft: '0.75rem' }}>
              <p>Fetching Referenda</p>
            </div>
          </Styles.EmptyWrapper>
        )}

        {referenda.length === 0 && !fetchingReferenda && (
          <Styles.EmptyWrapper>
            <div>
              <p>No referenda to display.</p>
            </div>
          </Styles.EmptyWrapper>
        )}

        {referenda.length > 0 && !fetchingReferenda && (
          <Styles.ItemsColumn>
            {tab === 'active' &&
              referenda.map((referendum, i) => (
                <ReferendumRow
                  key={`${i}_${referendum.refId}`}
                  referendum={referendum}
                />
              ))}
            {tab === 'history' &&
              referenda.map((referendum, i) => (
                <HistoryRow
                  key={`${i}_${referendum.refId}`}
                  info={referendum}
                />
              ))}
          </Styles.ItemsColumn>
        )}
      </Styles.FlexColumn>
    );
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
      {!getOnlineMode() && (
        <UI.OfflineBanner rounded={true} marginTop={'1rem'} />
      )}
      <Styles.PadWrapper>
        <Styles.FlexColumn $rowGap={'1.5rem'}>
          <section>
            <Styles.FlexColumn>
              <UI.ActionItem showIcon={false} text={`${chainId} Referenda`} />
              {/* Sorting controls */}
              <UI.ControlsWrapper
                className="ReferendaControls"
                $padBottom={true}
              >
                <UI.ButtonPrimaryInvert
                  className="back-btn"
                  text="Back"
                  iconLeft={faCaretLeft}
                  onClick={() => setSection(0)}
                  style={{
                    color:
                      chainId === 'Polkadot Asset Hub'
                        ? 'rgb(169, 74, 117)'
                        : 'rgb(133, 113, 177)',
                    borderColor:
                      chainId === 'Polkadot Asset Hub'
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
                    <UI.SortControlButton
                      isActive={true}
                      isDisabled={fetchingReferenda || !getOnlineMode()}
                      onClick={() => handleRefetchReferenda()}
                      faIcon={faArrowsRotate}
                      fixedWidth={false}
                      respClass="ReferendaControls"
                    />
                  </span>
                </UI.TooltipRx>
              </UI.ControlsWrapper>
            </Styles.FlexColumn>
          </section>

          <section>
            <Styles.FlexColumn>
              {!getOnlineMode() && !referendaMap.has(chainId) ? (
                <div style={{ padding: '0.5rem' }}>
                  <p>Currently offline.</p>
                  <p>Please reconnect to load OpenGov referenda.</p>
                </div>
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
                              className="filterContainer"
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
                                className="filterContainer"
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
                          </Wrappers.TracksFilterList>
                        </Styles.FlexRow>
                      </section>
                    </Styles.FlexColumn>
                    {renderListed('active')}
                  </Tabs.Content>
                  <Tabs.Content className="TabsContent" value="history">
                    {renderListed('history')}
                  </Tabs.Content>
                </Wrappers.TabsRoot>
              )}
            </Styles.FlexColumn>
          </section>
        </Styles.FlexColumn>
      </Styles.PadWrapper>
      <UI.LinksFooter openHelp={openHelp} />
    </UI.ScrollableMax>
  );
};
