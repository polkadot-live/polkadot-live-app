// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { Config as ConfigOpenGov } from '@/config/processes/openGov';
import { useHelp } from '@/renderer/contexts/common/Help';
import { useConnections } from '@/renderer/contexts/common/Connections';
import { useTracks } from '@/renderer/contexts/openGov/Tracks';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDownShortWide,
  faCaretLeft,
  faInfo,
} from '@fortawesome/pro-solid-svg-icons';
import { ContentWrapper, HeaderWrapper } from '@app/screens/Wrappers';
import { DragClose } from '@/renderer/library/DragClose';
import { StickyHeadings, TrackGroup } from './Wrappers';
import { ButtonPrimaryInvert } from '@/renderer/kits/Buttons/ButtonPrimaryInvert';
import { TrackRow } from './TrackRow';
import {
  renderPlaceholders,
  ControlsWrapper,
  StatsFooter,
  Scrollable,
  SortControlButton,
} from '@/renderer/utils/common';
import type { HelpItemKey } from '@/renderer/contexts/common/Help/types';
import type { TracksProps } from '../types';

export const Tracks = ({ setSection, chainId }: TracksProps) => {
  /// Context data.
  const { tracks, fetchingTracks, setFetchingTracks } = useTracks();
  const { openHelp } = useHelp();
  const { isConnected } = useConnections();

  /// Controls state.
  const [sortIdAscending, setSortIdAscending] = useState(true);

  /// Utility to render help icon.
  const renderHelpBadge = (label: string, key: HelpItemKey) => (
    <div className="stat-wrapper badge-btn" onClick={() => openHelp(key)}>
      <span>
        <div className="icon-wrapper">
          <FontAwesomeIcon icon={faInfo} transform={'shrink-0'} />
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
      <HeaderWrapper>
        <div className="content">
          <DragClose windowName="openGov" />
          <h3>{chainId} Origins and Tracks</h3>
        </div>
      </HeaderWrapper>
      <Scrollable>
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
                <>{renderPlaceholders(4)}</>
              ) : (
                <>
                  {/* Sticky Headings */}
                  <StickyHeadings>
                    <div className="content-wrapper">
                      <div className="left">
                        <div className="heading">ID</div>
                        <div className="heading">Origin</div>
                      </div>
                      <div className="right">
                        <div className="heading">Decision Deposit</div>
                        <div className="heading">Max. Ongoing</div>
                        <div className="heading">Metrics</div>
                      </div>
                    </div>
                  </StickyHeadings>

                  {/* Track Listing */}
                  <TrackGroup>
                    {tracks
                      .sort((a, b) =>
                        sortIdAscending
                          ? a.trackId - b.trackId
                          : b.trackId - a.trackId
                      )
                      .map((track) => (
                        <TrackRow key={track.trackId} track={track} />
                      ))}
                  </TrackGroup>
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
              <h2>Chain:</h2>
              <span>{chainId}</span>
            </div>
            <div className="footer-stat">
              <h2>Total Tracks:</h2>
              <span>{tracks.length}</span>
            </div>
          </section>
          <section className="right">
            <div className="footer-stat">
              <h2>Help:</h2>
            </div>
            {renderHelpBadge('Origin', 'help:openGov:origin')}
            {renderHelpBadge('Track', 'help:openGov:track')}
            {renderHelpBadge('Max Deciding', 'help:openGov:maxDeciding')}
          </section>
        </div>
      </StatsFooter>
    </>
  );
};
