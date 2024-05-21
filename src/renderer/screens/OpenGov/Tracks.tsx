// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useHelp } from '@/renderer/contexts/common/Help';
import { useTracks } from '@/renderer/contexts/openGov/Tracks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft, faInfo } from '@fortawesome/pro-solid-svg-icons';
import { ContentWrapper, HeaderWrapper } from '@app/screens/Wrappers';
import { DragClose } from '@/renderer/library/DragClose';
import { OpenGovFooter, Scrollable, TrackGroup } from './Wrappers';
import { ButtonPrimaryInvert } from '@/renderer/kits/Buttons/ButtonPrimaryInvert';
import { TrackRow } from './TrackRow';
import type { HelpItemKey } from '@/renderer/contexts/common/Help/types';
import type { TracksProps } from './types';

export const Tracks = ({ setSection, chainId }: TracksProps) => {
  /// Context data.
  const { tracks, fetchingTracks } = useTracks();
  const { openHelp } = useHelp();

  /// Utility to render help icon.
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
          <h3>{chainId} Origins and Tracks</h3>
        </div>
      </HeaderWrapper>
      <Scrollable>
        <ContentWrapper>
          {fetchingTracks ? (
            <p>Fetching tracks...</p>
          ) : (
            <TrackGroup>
              {tracks.map((track) => (
                <TrackRow key={track.trackId} track={track} />
              ))}
            </TrackGroup>
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
