// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as themeVariables from '../../../theme/variables';
import * as UI from '@polkadot-live/ui/components';
import * as Styles from '@polkadot-live/ui/styles';
import * as Tabs from '@radix-ui/react-tabs';
import * as Wrappers from './Wrappers';
import { LinksFooter } from '@app/Utils';
import { HistoryRow } from './HistoryRow';

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
    getActiveReferenda,
    updateTrackFilter,

    activePage,
    activePageCount,
    activePagedReferenda,
    showPageEllipsis,
    getPageNumbers,
    setActivePage,
    setRefTrigger,
    historyPage,
    historyPageCount,
    historyPagedReferenda,
    setHistoryPage,
    tabVal,
    setTabVal,
  } = useReferenda();

  const { fetchingMetadata } = usePolkassembly();
  const { fetchingTracks, getOrderedTracks } = useTracks();
  const { isSubscribedToReferendum, isNotSubscribedToAny } =
    useReferendaSubscriptions();

  // Flag to display referenda with active subscriptions.
  const [onlySubscribed, setOnlySubscribed] = useState(false);
  const [showSubscribedButton] = useState(false);

  // Pagination.
  const onPageClick = (tab: 'active' | 'history', val: number) => {
    switch (tab) {
      case 'active': {
        if (activePage !== val && !fetchingMetadata) {
          setActivePage(val);
        }
        break;
      }
      case 'history': {
        if (historyPage !== val && !fetchingMetadata) {
          setHistoryPage(val);
        }
        break;
      }
    }
  };
  const onPageArrowClick = (
    tab: 'active' | 'history',
    dir: 'prev' | 'next'
  ) => {
    if (fetchingMetadata) {
      return;
    } else if (dir === 'prev' && tab === 'active') {
      setActivePage((pv) => (pv > 1 ? pv - 1 : pv));
    } else if (dir === 'prev' && tab === 'history') {
      setHistoryPage((pv) => (pv > 1 ? pv - 1 : pv));
    } else if (dir === 'next' && tab === 'active') {
      setActivePage((pv) => (pv < activePageCount ? pv + 1 : pv));
    } else if (dir === 'next' && tab === 'history') {
      setHistoryPage((pv) => (pv < historyPageCount ? pv + 1 : pv));
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
      <Wrappers.PaginationRow>
        <button
          className={`btn ${activePage === 1 && 'disable'} ${fetchingMetadata && 'fetching'}`}
          disabled={activePage === 1}
          onClick={() => onPageArrowClick('active', 'prev')}
        >
          <FontAwesomeIcon icon={faCaretLeft} />
        </button>
        {getPageNumbers('active').map((i, j) => (
          <Styles.FlexRow key={i} $row={'0.75rem'}>
            {j === 2 && !showPageEllipsis('active') && activePageCount > 4 && (
              <button className={`btn placeholder`}>
                <FontAwesomeIcon className="icon" icon={faEllipsis} />
              </button>
            )}
            <button
              onClick={() => onPageClick('active', i)}
              className={`btn ${activePage === i && 'selected'} ${fetchingMetadata && 'fetching'}
              ${j === 2 && getPageNumbers('active').length === 5 && 'middle'}`}
            >
              {i}
            </button>
          </Styles.FlexRow>
        ))}
        <button
          className={`btn ${activePage === activePageCount && 'disable'} ${fetchingMetadata && 'fetching'}`}
          disabled={activePage === activePageCount}
          onClick={() => onPageArrowClick('active', 'next')}
        >
          <FontAwesomeIcon icon={faCaretRight} />
        </button>

        {fetchingMetadata && (
          <PuffLoader size={20} color={'var(--text-color-primary)'} />
        )}
      </Wrappers.PaginationRow>

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

  const renderHistory = () => (
    <Styles.FlexColumn style={{ marginTop: '1rem' }}>
      <Wrappers.PaginationRow>
        <button
          className={`btn ${historyPage === 1 && 'disable'} ${fetchingMetadata && 'fetching'}`}
          disabled={historyPage === 1}
          onClick={() => onPageArrowClick('history', 'prev')}
        >
          <FontAwesomeIcon icon={faCaretLeft} />
        </button>
        {getPageNumbers('history').map((i, j) => (
          <Styles.FlexRow key={i} $row={'0.75rem'}>
            {j === 2 &&
              !showPageEllipsis('history') &&
              historyPageCount > 4 && (
                <button className={`btn placeholder`}>
                  <FontAwesomeIcon className="icon" icon={faEllipsis} />
                </button>
              )}
            <button
              onClick={() => onPageClick('history', i)}
              className={`btn ${historyPage === i && 'selected'} ${fetchingMetadata && 'fetching'}
              ${j === 2 && getPageNumbers('history').length === 5 && 'middle'}`}
            >
              {i}
            </button>
          </Styles.FlexRow>
        ))}
        <button
          className={`btn ${historyPage === historyPageCount && 'disable'} ${fetchingMetadata && 'fetching'}`}
          disabled={historyPage === historyPageCount}
          onClick={() => onPageArrowClick('history', 'next')}
        >
          <FontAwesomeIcon icon={faCaretRight} />
        </button>

        {fetchingMetadata && (
          <PuffLoader size={20} color={'var(--text-color-primary)'} />
        )}
      </Wrappers.PaginationRow>
      <ItemsColumn>
        {historyPagedReferenda.map((referendum, i) => (
          <HistoryRow key={`${i}_${referendum.refId}`} info={referendum} />
        ))}
      </ItemsColumn>
    </Styles.FlexColumn>
  );

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
                              <Wrappers.TracksFilterList id="TracksContainer">
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

                          {!onlySubscribed && renderListed()}
                          {onlySubscribed && renderSubscribedListed()}
                        </Styles.FlexColumn>
                      </Tabs.Content>
                      <Tabs.Content className="TabsContent" value="history">
                        {renderHistory()}
                      </Tabs.Content>
                    </Wrappers.TabsRoot>
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
