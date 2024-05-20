// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DragClose } from '@/renderer/library/DragClose';
import { Config as ConfigOpenGov } from '@/config/processes/openGov';
import { ContentWrapper, HeaderWrapper } from '@app/screens/Wrappers';
import { useOpenGovMessagePorts } from '@/renderer/hooks/useOpenGovMessagePorts';
import { useState } from 'react';
import { ModalSection } from '@/renderer/kits/Overlay/structure/ModalSection';
import { ModalMotionTwoSection } from '@/renderer/kits/Overlay/structure/ModalMotionTwoSection';
import { Tracks } from './Tracks';
import { ModalConnectItem } from '@/renderer/kits/Overlay/structure/ModalConnectItem';
import { ModalHardwareItem } from '@/renderer/kits/Overlay/structure/ModalHardwareItem';
import { ButtonHelp } from '@/renderer/kits/Buttons/ButtonHelp';
import { ButtonMonoInvert } from '@/renderer/kits/Buttons/ButtonMonoInvert';
import { ActionItem } from '@/renderer/library/ActionItem';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { useHelp } from '@/renderer/contexts/common/Help';
import { useTracks } from '@/renderer/contexts/openGov/Tracks';
import { chainIcon } from '@/config/chains';
import type { ChainID } from '@/types/chains';

export const OpenGov: React.FC = () => {
  /// Set up port communication for `openGov` window.
  useOpenGovMessagePorts();

  /// Help overlay.
  const { openHelp } = useHelp();
  const { setFetchingTracks, setActiveChainId, activeChainId } = useTracks();

  /// Active section.
  const [section, setSection] = useState<number>(0);

  /// Open origins and tracks information.
  const handleOpenTracks = (chainId: ChainID) => {
    setActiveChainId(chainId);
    setFetchingTracks(true);

    // Request tracks data from main renderer.
    ConfigOpenGov.portOpenGov.postMessage({
      task: 'openGov:tracks:get',
      data: {
        chainId,
      },
    });
    setSection(1);
  };

  /// Function to render a chain icon.
  const renderChainIcon = (chainId: ChainID) => {
    const ChainIcon = chainIcon(chainId);
    switch (chainId) {
      case 'Kusama': {
        return <ChainIcon className="chain-icon" style={{ opacity: '0.75' }} />;
      }
      case 'Polkadot': {
        return (
          <ChainIcon
            className="chain-icon"
            style={{ width: '2.5rem', height: '2.5rem', opacity: '0.75' }}
          />
        );
      }
    }
  };

  return (
    <ModalSection type="carousel">
      <ModalMotionTwoSection
        animate={section === 0 ? 'home' : 'next'}
        transition={{
          duration: 0.5,
          type: 'spring',
          bounce: 0.1,
        }}
        variants={{
          home: {
            left: 0,
          },
          next: {
            left: '-100%',
          },
        }}
      >
        {/* Section 1 */}
        <section className="carousel-section-wrapper">
          <HeaderWrapper>
            <div className="content">
              <DragClose windowName="openGov" />
              <h3>OpenGov</h3>
            </div>
          </HeaderWrapper>

          <ContentWrapper style={{ paddingTop: '1rem' }}>
            <ActionItem text={'Explore OpenGov'} />
            <div className="grid-wrapper">
              {/* Polkadot */}
              <ModalConnectItem>
                <ModalHardwareItem>
                  <div
                    className="body"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      rowGap: '1.5rem',
                      padding: '1.75rem',
                    }}
                  >
                    <div className="status">
                      <ButtonHelp
                        onClick={() => openHelp('help:openGov:origin')}
                      />
                    </div>
                    <div className="row">
                      <div
                        style={{
                          width: '3rem',
                          height: '3rem',
                          minHeight: '3rem',
                        }}
                      >
                        {renderChainIcon('Polkadot')}
                      </div>
                    </div>
                    <div className="row">
                      <ButtonMonoInvert
                        iconLeft={faCaretRight}
                        text={'Tracks on Polkadot'}
                        onClick={() => handleOpenTracks('Polkadot')}
                        style={{
                          color: 'rgb(169 74 117)',
                          borderColor: 'rgb(169 74 117)',
                        }}
                      />
                    </div>
                  </div>
                </ModalHardwareItem>
              </ModalConnectItem>

              {/* Kusama */}
              <ModalConnectItem>
                <ModalHardwareItem>
                  <div
                    className="body"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      rowGap: '1.5rem',
                      padding: '1.75rem',
                    }}
                  >
                    <div className="status">
                      <ButtonHelp
                        onClick={() => openHelp('help:openGov:origin')}
                      />
                    </div>
                    <div className="row">
                      <div
                        style={{
                          width: '3rem',
                          height: '3rem',
                          minHeight: '3rem',
                        }}
                      >
                        {renderChainIcon('Kusama')}
                      </div>
                    </div>
                    <div className="row">
                      <ButtonMonoInvert
                        iconLeft={faCaretRight}
                        text={'Tracks on Kusama'}
                        onClick={() => handleOpenTracks('Kusama')}
                        style={{
                          color: '#8571b1',
                          borderColor: '#8571b1',
                        }}
                      />
                    </div>
                  </div>
                </ModalHardwareItem>
              </ModalConnectItem>
            </div>
          </ContentWrapper>
        </section>

        {/* Section 2 */}
        <section className="carousel-section-wrapper">
          <Tracks setSection={setSection} chainId={activeChainId} />
        </section>
      </ModalMotionTwoSection>
    </ModalSection>
  );
};
