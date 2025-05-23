// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import * as Styles from '@polkadot-live/ui/styles';
import { ConfigOpenGov } from '@polkadot-live/core';
import { useConnections, useHelp } from '@ren/contexts/common';
import { useTracks } from '@ren/contexts/openGov';
import { useEffect, useState } from 'react';
import {
  faArrowDownShortWide,
  faCaretLeft,
} from '@fortawesome/free-solid-svg-icons';
import { ButtonPrimaryInvert } from '@polkadot-live/ui/kits/buttons';
import { StickyHeadingsRow, TrackRow } from './TrackRow';
import { renderPlaceholders } from '@polkadot-live/ui/utils';
import { ItemsColumn } from '../../Home/Manage/Wrappers';
import type { TracksProps } from '../types';

export const Tracks = ({ setSection }: TracksProps) => {
  const { getOnlineMode } = useConnections();
  const { openHelp } = useHelp();

  const {
    activeChainId: chainId,
    fetchingTracks,
    tracksMap,
    setFetchingTracks,
  } = useTracks();

  // Controls state.
  const [sortIdAscending, setSortIdAscending] = useState(true);
  const hasFetched = tracksMap.has(chainId);

  /// Re-fetch tracks if app goes online from offline mode.
  useEffect(() => {
    if (getOnlineMode() && !hasFetched) {
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
    <UI.ScrollableMax>
      <Styles.PadWrapper>
        <Styles.FlexColumn $rowGap={'0.75rem'}>
          <section>
            <UI.ActionItem
              showIcon={false}
              text={`${chainId} Tracks`}
              style={{ marginBottom: '1rem' }}
            />
            {/* Sorting controls */}
            <UI.ControlsWrapper $padBottom={true}>
              <ButtonPrimaryInvert
                disabled={fetchingTracks}
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
                isDisabled={fetchingTracks}
                faIcon={faArrowDownShortWide}
                onClick={() => setSortIdAscending(!sortIdAscending)}
                onLabel="ID Ascend"
                offLabel="ID Descend"
              />
            </UI.ControlsWrapper>
          </section>

          <section>
            {/** Offline and not fetched */}
            {!getOnlineMode() && !hasFetched && (
              <div style={{ padding: '0.5rem' }}>
                <p>Currently offline.</p>
                <p>Please reconnect to load OpenGov tracks.</p>
              </div>
            )}
            {/** Online and not fetched */}
            {getOnlineMode() && !hasFetched && !fetchingTracks && (
              <div style={{ padding: '0.5rem' }}>
                <p>Could not fetch tracks.</p>
              </div>
            )}
            {/** Fetching */}
            {fetchingTracks && (
              <div style={{ marginTop: '2rem' }}>{renderPlaceholders(4)}</div>
            )}
            {/** Online and fetched */}
            {hasFetched && !fetchingTracks && tracksMap.has(chainId) && (
              <div>
                {fetchingTracks || !tracksMap.has(chainId) ? (
                  <div style={{ marginTop: '2rem' }}>
                    {renderPlaceholders(4)}
                  </div>
                ) : (
                  <>
                    <StickyHeadingsRow />
                    {/* Track Listing */}
                    <ItemsColumn>
                      {tracksMap
                        .get(chainId)!
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
          </section>
        </Styles.FlexColumn>
      </Styles.PadWrapper>
      <UI.LinksFooter openHelp={openHelp} />
    </UI.ScrollableMax>
  );
};
