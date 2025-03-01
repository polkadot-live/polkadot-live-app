// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import * as Styles from '@polkadot-live/ui/styles';

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
import { ButtonPrimaryInvert } from '@polkadot-live/ui/kits/buttons';
import { StickyHeadingsRow, TrackRow } from './TrackRow';
import { renderPlaceholders } from '@polkadot-live/ui/utils';
import { ItemsColumn } from '../../Home/Manage/Wrappers';
import type { HelpItemKey } from '@polkadot-live/types/help';
import type { TracksProps } from '../types';

export const Tracks = ({ section, setSection }: TracksProps) => {
  const { openHelp } = useHelp();
  const { getOnlineMode } = useConnections();

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
    if (getOnlineMode()) {
      setFetchingTracks(true);

      // Request tracks data from main renderer.
      ConfigOpenGov.portOpenGov.postMessage({
        task: 'openGov:tracks:get',
        data: {
          chainId,
        },
      });
    }
  }, [getOnlineMode()]);

  return (
    <>
      <UI.ScrollableMax style={{ paddingTop: '0', paddingBottom: '2rem' }}>
        <div style={{ padding: '0.5rem 1.5rem 0rem' }}>
          <UI.ActionItem
            showIcon={false}
            text={`${chainId} Tracks`}
            style={{ marginBottom: '1rem' }}
          />
        </div>
        <ContentWrapper>
          {/* Sorting controls */}
          <UI.ControlsWrapper $padBottom={true}>
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
            <UI.SortControlButton
              isActive={sortIdAscending}
              isDisabled={!getOnlineMode() || fetchingTracks}
              faIcon={faArrowDownShortWide}
              onClick={() => setSortIdAscending(!sortIdAscending)}
              onLabel="ID Ascend"
              offLabel="ID Descend"
            />
          </UI.ControlsWrapper>

          {!getOnlineMode() ? (
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
                  <StickyHeadingsRow />
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
      </UI.ScrollableMax>
      {section === 1 && (
        <Styles.StatsFooter $chainId={chainId}>
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
        </Styles.StatsFooter>
      )}
    </>
  );
};
