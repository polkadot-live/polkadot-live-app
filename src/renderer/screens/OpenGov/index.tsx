// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DragClose } from '@/renderer/library/DragClose';
import { ContentWrapper, HeaderWrapper } from '@app/screens/Wrappers';
import { useOpenGovMessagePorts } from '@/renderer/hooks/useOpenGovMessagePorts';
import { Config as ConfigOpenGov } from '@/config/processes/openGov';
import { useTracks } from '@/renderer/contexts/openGov/Tracks';

export const OpenGov: React.FC = () => {
  // Set up port communication for `openGov` window.
  useOpenGovMessagePorts();

  // Context data.
  const { tracks } = useTracks();

  const handleTestClick = () => {
    console.log('TODO: Get Polkadot origins + tracks listings');

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
      <ContentWrapper>
        <p>
          <button onClick={() => handleTestClick()}>Get Tracks</button>
        </p>
        <ul>
          {tracks.map((track) => (
            <li key={track.trackId}>
              <span>
                {track.trackId} {track.label} {track.maxDeciding}
              </span>
            </li>
          ))}
        </ul>
      </ContentWrapper>
    </>
  );
};
