// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigOpenGov } from '@ren/config/processes/openGov';
import { useHelp } from '@app/contexts/common/Help';
import { useConnections } from '@app/contexts/common/Connections';
import { useTracks } from '@app/contexts/openGov/Tracks';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDownShortWide,
  faCaretLeft,
  faInfo,
} from '@fortawesome/free-solid-svg-icons';
import { ContentWrapper } from '@app/screens/Wrappers';
import { StickyHeadings } from './Wrappers';
import { ButtonPrimaryInvert } from '@polkadot-live/ui/kits/buttons';
import { TrackRow } from './TrackRow';
import {
  ControlsWrapper,
  SortControlButton,
} from '@polkadot-live/ui/components';
import { Scrollable, StatsFooter } from '@polkadot-live/ui/styles';
import { renderPlaceholders } from '@polkadot-live/ui/utils';
import { ItemsColumn } from '../../Home/Manage/Wrappers';
import type { HelpItemKey } from '@polkadot-live/types/help';
import type { TracksProps } from '../types';

export const Tracks = ({ setSection }: TracksProps) => {
  const { openHelp } = useHelp();
  const { isConnected } = useConnections();

  const {
    activeChainId: chainId,
    fetchingTracks,
    tracks,
    setFetchingTracks,
  } = useTracks();

  /// Controls state.
  const [sortIdAscending, setSortIdAscending] = useState(true);

  /// Utility to render help icon.
  const renderHelpBadge = (label: string, key: HelpItemKey) => (
    <div className="stat-wrapper badge-btn" onClick={() => openHelp(key)}>
      <span style={{ fontSize: '0.9rem' }}>
        <div className="icon-wrapper">
          <FontAwesomeIcon icon={faInfo} transform={'grow-2'} />
        </div>
        {label}
      </span>
    </div>
  );

  /// Re-fetch tracks if app goes online from offline mode.
  useEffect(() => {
    if (isConnected) {
      setFetchingTracks(true);

      // Request tracks data from main renderer.
      ConfigOpenGov.portOpenGov.postMessage({
        task: 'openGov:tracks:get',
        data: {
          chainId,
        },
      });
    }
  }, [isConnected]);

  return (
    <>
      <Scrollable style={{ paddingBottom: '2rem' }}>
        <ContentWrapper>
          {/* Sorting controls */}
          <ControlsWrapper $padBottom={true}>
            <ButtonPrimaryInvert
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
            <SortControlButton
              isActive={sortIdAscending}
              isDisabled={!isConnected || fetchingTracks}
              faIcon={faArrowDownShortWide}
              onClick={() => setSortIdAscending(!sortIdAscending)}
              onLabel="ID Ascend"
              offLabel="ID Descend"
            />
          </ControlsWrapper>

          {!isConnected ? (
            <div style={{ padding: '0.5rem' }}>
              <p>Currently offline.</p>
              <p>Please reconnect to load OpenGov tracks.</p>
            </div>
          ) : (
            <div>
              {fetchingTracks ? (
                <div style={{ marginTop: '2rem' }}>{renderPlaceholders(4)}</div>
              ) : (
                <>
                  {/* Sticky Headings */}
                  <StickyHeadings>
                    <div className="content-wrapper">
                      <div className="left">
                        <div className="heading">ID</div>
                        <div className="heading">Track</div>
                      </div>
                      <div className="right">
                        <div className="heading">Decision Deposit</div>
                        <div className="heading">Max Deciding</div>
                        <div className="heading">Timeline</div>
                      </div>
                    </div>
                  </StickyHeadings>

                  {/* Track Listing */}
                  <ItemsColumn>
                    {tracks
                      .sort((a, b) =>
                        sortIdAscending
                          ? a.trackId - b.trackId
                          : b.trackId - a.trackId
                      )
                      .map((track) => (
                        <TrackRow key={track.trackId} track={track} />
                      ))}
                  </ItemsColumn>
                </>
              )}
            </div>
          )}
        </ContentWrapper>
      </Scrollable>
      <StatsFooter $chainId={chainId}>
        <div>
          <section className="left">
            <div className="footer-stat">
              <h2>Total Tracks:</h2>
              <span>{tracks.length}</span>
            </div>
          </section>
          <section className="right">
            <div className="footer-stat">
              <h2>Help:</h2>
            </div>
            {renderHelpBadge('Track', 'help:openGov:track')}
            {renderHelpBadge('Max Deciding', 'help:openGov:maxDeciding')}
          </section>
        </div>
      </StatsFooter>
    </>
  );
};
