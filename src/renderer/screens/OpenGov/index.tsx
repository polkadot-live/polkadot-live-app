// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DragClose } from '@/renderer/library/DragClose';
import { ContentWrapper, HeaderWrapper } from '@app/screens/Wrappers';
import { useOpenGovMessagePorts } from '@/renderer/hooks/useOpenGovMessagePorts';
import { Config as ConfigOpenGov } from '@/config/processes/openGov';
import { useHelp } from '@/renderer/contexts/common/Help';
import { useTracks } from '@/renderer/contexts/openGov/Tracks';
import { TrackRow } from './TrackRow';
import { OpenGovFooter, Scrollable, TrackGroup } from './Wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfo } from '@fortawesome/pro-solid-svg-icons';
import type { HelpItemKey } from '@/renderer/contexts/common/Help/types';

export const OpenGov: React.FC = () => {
  // Set up port communication for `openGov` window.
  useOpenGovMessagePorts();

  // Context data.
  const { tracks } = useTracks();
  const { openHelp } = useHelp();
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

  const renderHelpIcon = (key: HelpItemKey) => (
    <div className="icon-wrapper" onClick={() => openHelp(key)}>
      <FontAwesomeIcon icon={faInfo} transform={'shrink-0'} />
    </div>
  );

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
        <div className="footer-wrapper">
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
              <span>{renderHelpIcon('help:openGov:trackId')} Track ID</span>
            </div>
            <div className="stat-wrapper">
              <span>{renderHelpIcon('help:openGov:origin')} Origin</span>
            </div>
            <div className="stat-wrapper">
              <span>
                {renderHelpIcon('help:openGov:maxDeciding')} Max Deciding
              </span>
            </div>
          </section>
        </div>
      </OpenGovFooter>
    </>
  );
};
