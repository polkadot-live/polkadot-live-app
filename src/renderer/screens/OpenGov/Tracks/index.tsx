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
import { OpenGovFooter } from '../Wrappers';
import { TrackGroup } from './Wrappers';
import { ButtonPrimaryInvert } from '@/renderer/kits/Buttons/ButtonPrimaryInvert';
import { TrackRow } from './TrackRow';
import {
  ControlsWrapper,
  Scrollable,
  SortControlButton,
  renderPlaceholders,
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
  const renderHelpIcon = (key: HelpItemKey) => (
    <div className="icon-wrapper" onClick={() => openHelp(key)}>
      <FontAwesomeIcon icon={faInfo} transform={'shrink-0'} />
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
              )}
            </div>
          )}
        </ContentWrapper>
      </Scrollable>
      <OpenGovFooter $chainId={chainId}>
        <div>
          <section className="left">
            <div className="footer-stat">
              <h2>Chain ID:</h2>
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
            <div className="stat-wrapper">
              <span>{renderHelpIcon('help:openGov:origin')} Origin</span>
            </div>
            <div className="stat-wrapper">
              <span>{renderHelpIcon('help:openGov:track')} Track</span>
            </div>
            <div className="stat-wrapper">
              <span>
                {renderHelpIcon('help:openGov:maxDeciding')} Max Deciding
              </span>
            </div>
            <ButtonPrimaryInvert
              text={'Back'}
              iconLeft={faCaretLeft}
              style={{
                padding: '0.3rem 1.25rem',
                color:
                  chainId === 'Polkadot'
                    ? 'rgb(169, 74, 117)'
                    : 'rgb(133, 113, 177)',
                borderColor:
                  chainId === 'Polkadot'
                    ? 'rgb(169, 74, 117)'
                    : 'rgb(133, 113, 177)',
              }}
              onClick={() => setSection(0)}
            />
          </section>
        </div>
      </OpenGovFooter>
    </>
  );
};
