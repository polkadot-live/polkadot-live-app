// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import * as Styles from '@polkadot-live/styles/wrappers';
import { useConnections, useHelp, useTracks } from '@polkadot-live/contexts';
import { useEffect, useState } from 'react';
import {
  faArrowDownShortWide,
  faCaretLeft,
} from '@fortawesome/free-solid-svg-icons';
import { ButtonPrimaryInvert } from '@polkadot-live/ui/kits/buttons';
import { PuffLoader } from 'react-spinners';
import { StickyHeadingsRow, TrackRow } from './TrackRow';
import type { TracksProps } from '../types';

export const Tracks = ({ setSection }: TracksProps) => {
  const { getOnlineMode } = useConnections();
  const { openHelp } = useHelp();
  const {
    activeChainId: chainId,
    fetchingTracks,
    tracksMap,
    requestTracks,
  } = useTracks();

  // Controls state.
  const [sortIdAscending, setSortIdAscending] = useState(true);
  const hasFetched = tracksMap.has(chainId);

  // Re-fetch tracks if app goes online from offline mode.
  useEffect(() => {
    if (getOnlineMode() && !hasFetched) {
      requestTracks(chainId);
    }
  }, [getOnlineMode()]);

  const hasFetchFailed = () => {
    const a = !getOnlineMode() && !hasFetched;
    const b = getOnlineMode() && !hasFetched && !fetchingTracks;
    return a || b;
  };

  return (
    <UI.ScrollableMax>
      {!getOnlineMode() && (
        <UI.OfflineBanner rounded={true} marginTop={'1rem'} />
      )}
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
                    chainId === 'Polkadot Asset Hub'
                      ? 'rgb(169, 74, 117)'
                      : 'rgb(133, 113, 177)',
                  borderColor:
                    chainId === 'Polkadot Asset Hub'
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
            {/** Fetch failed */}
            {hasFetchFailed() && (
              <Styles.EmptyWrapper>
                <div>
                  <p>No tracks to display.</p>
                </div>
              </Styles.EmptyWrapper>
            )}

            {/** Fetching */}
            {fetchingTracks && (
              <Styles.EmptyWrapper>
                <PuffLoader size={20} color={'var(--text-color-primary)'} />
                <div style={{ paddingLeft: '0.75rem' }}>
                  <p>Fetching Tracks</p>
                </div>
              </Styles.EmptyWrapper>
            )}

            {/** Online and fetched */}
            {hasFetched && !fetchingTracks && tracksMap.has(chainId) && (
              <>
                <StickyHeadingsRow />
                {/* Track Listing */}
                <Styles.ItemsColumn>
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
                </Styles.ItemsColumn>
              </>
            )}
          </section>
        </Styles.FlexColumn>
      </Styles.PadWrapper>
      <UI.LinksFooter openHelp={openHelp} />
    </UI.ScrollableMax>
  );
};
