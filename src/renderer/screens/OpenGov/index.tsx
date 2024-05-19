// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DragClose } from '@/renderer/library/DragClose';
import { ContentWrapper, HeaderWrapper } from '@app/screens/Wrappers';
import { useOpenGovMessagePorts } from '@/renderer/hooks/useOpenGovMessagePorts';
import { Config as ConfigOpenGov } from '@/config/processes/openGov';
import { useTracks } from '@/renderer/contexts/openGov/Tracks';
import { TrackRow } from './TrackRow';
import { OpenGovFooter, Scrollable, TrackGroup } from './Wrappers';

export const OpenGov: React.FC = () => {
  // Set up port communication for `openGov` window.
  useOpenGovMessagePorts();

  // Context data.
  const { tracks } = useTracks();
  const chainId = 'Polkadot';

  const handleTestClick = () => {
    // Request tracks data from main renderer.
    ConfigOpenGov.portOpenGov.postMessage({
      task: 'openGov:tracks:get',
      data: {
        chainId: 'Polkadot',
      },
    });
  };

  return (
    <>
      <HeaderWrapper>
        <div className="content">
          <DragClose windowName="openGov" />
          <h3>Explore Open Gov</h3>
        </div>
      </HeaderWrapper>
      <Scrollable>
        <ContentWrapper>
          <p>
            <button onClick={() => handleTestClick()}>Get Tracks</button>
          </p>
          <TrackGroup>
            {tracks.map((track) => (
              <TrackRow key={track.trackId} track={track} />
            ))}
          </TrackGroup>
        </ContentWrapper>
      </Scrollable>
      <OpenGovFooter>
        <div>
          <div className="footer-stat">
            <h2>Chain ID:</h2>
            <span>{chainId}</span>
          </div>
          <div className="footer-stat">
            <h2>Total Tracks:</h2>
            <span>{tracks.length}</span>
          </div>
        </div>
      </OpenGovFooter>
    </>
  );
};
