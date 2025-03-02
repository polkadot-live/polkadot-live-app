// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import { LinksFooter } from '@app/Utils';
import { Config as ConfigOpenGov } from '@ren/config/processes/openGov';
import { useConnections } from '@app/contexts/common/Connections';
import { useTracks } from '@app/contexts/openGov/Tracks';
import { useEffect, useState } from 'react';
import {
  faArrowDownShortWide,
  faCaretLeft,
} from '@fortawesome/free-solid-svg-icons';
import { ContentWrapper } from '@app/screens/Wrappers';
import { ButtonPrimaryInvert } from '@polkadot-live/ui/kits/buttons';
import { StickyHeadingsRow, TrackRow } from './TrackRow';
import { renderPlaceholders } from '@polkadot-live/ui/utils';
import { ItemsColumn } from '../../Home/Manage/Wrappers';
import type { TracksProps } from '../types';

export const Tracks = ({ setSection }: TracksProps) => {
  const { getOnlineMode } = useConnections();

  const {
    activeChainId: chainId,
    fetchingTracks,
    tracks,
    setFetchingTracks,
  } = useTracks();

  /// Controls state.
  const [sortIdAscending, setSortIdAscending] = useState(true);

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
    <UI.ScrollableMax>
      <ContentWrapper style={{ padding: '1rem 1.5rem' }}>
        <UI.ActionItem
          showIcon={false}
          text={`${chainId} Tracks`}
          style={{ marginBottom: '1rem' }}
        />
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
      <LinksFooter />
    </UI.ScrollableMax>
  );
};
