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
import { ButtonMonoInvert } from '@/renderer/kits/Buttons/ButtonMonoInvert';
import { ActionItem } from '@/renderer/library/ActionItem';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { useTracks } from '@/renderer/contexts/openGov/Tracks';
import { chainIcon } from '@/config/chains';
import type { ChainID } from '@/types/chains';
import { Referenda } from './Referenda';
import { useReferenda } from '@/renderer/contexts/openGov/Referenda';

export const OpenGov: React.FC = () => {
  /// Set up port communication for `openGov` window.
  useOpenGovMessagePorts();
  /// Help overlay.
  const { setFetchingTracks, setActiveChainId, activeChainId } = useTracks();
  const {
    setFetchingReferenda,
    setActiveReferendaChainId,
    activeReferendaChainId,
  } = useReferenda();

  /// Active section.
  const [section, setSection] = useState<number>(0);
  /// Section 2 page.
  const [sectionContent, setSectionContent] = useState('');

  /// Open origins and tracks information.
  const handleOpenTracks = (chainId: ChainID) => {
    setSectionContent('tracks');
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

  /// Open proposals.
  const handleOpenReferenda = (chainId: ChainID) => {
    setSectionContent('referenda');
    setFetchingReferenda(true);
    setActiveReferendaChainId(chainId);

    ConfigOpenGov.portOpenGov.postMessage({
      task: 'openGov:referenda:get',
      data: {
        chainId,
      },
    });

    setSection(1);
  };

  /// Temporary function to render a chain icon.
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

  /// Temporary function to render a grid card.
  const renderGridCard = (chainId: ChainID, title: string, handler: string) => {
    // Style for navigation button.
    const buttonStyle =
      chainId === 'Polkadot'
        ? {
            color: 'rgb(169 74 117)',
            borderColor: 'rgb(169 74 117)',
          }
        : {
            color: '#8571b1',
            borderColor: '#8571b1',
          };

    // Style for icon container.
    const iconContainerStyle = {
      width: '3rem',
      height: '3rem',
      minHeight: '3rem',
    };

    const handleClick = () => {
      switch (handler) {
        case 'open-tracks': {
          handleOpenTracks(chainId);
          break;
        }
        case 'open-proposals': {
          handleOpenReferenda(chainId);
          break;
        }
        default: {
          throw new Error('Task unknown.');
        }
      }
    };

    return (
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
            <div className="row">
              <div style={{ ...iconContainerStyle }}>
                {renderChainIcon(chainId)}
              </div>
            </div>
            <div className="row">
              <ButtonMonoInvert
                iconLeft={faCaretRight}
                text={title}
                onClick={() => handleClick()}
                style={{ ...buttonStyle }}
              />
            </div>
          </div>
        </ModalHardwareItem>
      </ModalConnectItem>
    );
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
            {/* Origins and Tracks */}
            <ActionItem text={'Origins and Tracks'} />
            <div className="grid-wrapper" style={{ marginBottom: '1.5rem' }}>
              {renderGridCard('Polkadot', 'On Polkadot', 'open-tracks')}
              {renderGridCard('Kusama', 'On Kusama', 'open-tracks')}
            </div>

            {/* Proposals */}
            <ActionItem text={'Referenda'} />
            <div className="grid-wrapper">
              {renderGridCard('Polkadot', 'On Polkadot', 'open-proposals')}
              {renderGridCard('Kusama', 'On Kusama', 'open-proposals')}
            </div>
          </ContentWrapper>
        </section>

        {/* Section 2 */}
        <section className="carousel-section-wrapper">
          {sectionContent === 'tracks' && (
            <Tracks setSection={setSection} chainId={activeChainId} />
          )}
          {sectionContent === 'referenda' && (
            <Referenda
              setSection={setSection}
              chainId={activeReferendaChainId}
            />
          )}
        </section>
      </ModalMotionTwoSection>
    </ModalSection>
  );
};
