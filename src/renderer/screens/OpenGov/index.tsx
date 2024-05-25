// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DragClose } from '@/renderer/library/DragClose';
import { Config as ConfigOpenGov } from '@/config/processes/openGov';
import { ContentWrapper, HeaderWrapper } from '@app/screens/Wrappers';
import { useOpenGovMessagePorts } from '@/renderer/hooks/useOpenGovMessagePorts';
import { useEffect, useState } from 'react';
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
import { Referenda } from './Referenda';
import { useReferenda } from '@/renderer/contexts/openGov/Referenda';
import { useTreasury } from '@/renderer/contexts/openGov/Treasury';
import { TreasuryStats } from './Wrappers';
import { faInfo } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useHelp } from '@/renderer/contexts/common/Help';
import type { ChainID } from '@/types/chains';
import type { HelpItemKey } from '@/renderer/contexts/common/Help/types';
import {
  createArrayWithLength,
  renderPlaceholders,
} from '@/renderer/utils/common';

export const OpenGov: React.FC = () => {
  /// Set up port communication for `openGov` window.
  useOpenGovMessagePorts();

  /// Treasury context.
  const {
    fetchingTreasuryData,
    initTreasury,
    getFormattedFreeBalance,
    getFormattedNextBurn,
    getFormattedToBeAwarded,
    getSpendPeriodProgress,
  } = useTreasury();

  /// Help overlay.
  const { openHelp } = useHelp();

  /// Tracks context.
  const { setFetchingTracks, setActiveChainId, activeChainId } = useTracks();
  const {
    setFetchingReferenda,
    setActiveReferendaChainId,
    activeReferendaChainId,
  } = useReferenda();

  /// Section state.
  const [section, setSection] = useState<number>(0);
  const [sectionContent, setSectionContent] = useState('');

  /// Initialize treasury data when window opens.
  useEffect(() => {
    // Wait until the port has been initialized before attempting
    // to send the initialization message to the main renderer.
    if (!ConfigOpenGov.portExists()) {
      const intervalId = setInterval(() => {
        if (ConfigOpenGov.portExists()) {
          clearInterval(intervalId);
          initTreasury();
        }
      }, 1_000);
    } else {
      initTreasury();
    }
  }, []);

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
            style={{ width: '1.5rem', height: '1.5rem', opacity: '0.75' }}
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
      width: '1.5rem',
      height: '1.5rem',
      minHeight: '1.5rem',
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
        <ModalHardwareItem style={{ backgroundColor: '#141414' }}>
          <div
            className="body"
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '1rem',
            }}
          >
            <div className="row">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  columnGap: '1.5rem',
                }}
              >
                <div style={{ ...iconContainerStyle }}>
                  {renderChainIcon(chainId)}
                </div>
                <ButtonMonoInvert
                  iconLeft={faCaretRight}
                  text={title}
                  onClick={() => handleClick()}
                  style={{ ...buttonStyle }}
                />
              </div>
            </div>
          </div>
        </ModalHardwareItem>
      </ModalConnectItem>
    );
  };

  /// Helper to render a help info icon.
  const renderInfoIcon = (label: string, helpKey: HelpItemKey) => (
    <span>
      {label}
      <div className="icon-wrapper" onClick={() => openHelp(helpKey)}>
        <FontAwesomeIcon icon={faInfo} transform={'shrink-0'} />
      </div>
    </span>
  );

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

          <TreasuryStats>
            {fetchingTreasuryData ? (
              <div className="loading-wrapper">
                {createArrayWithLength(3).map(() =>
                  renderPlaceholders(0, '68.47px', '0.5rem')
                )}
              </div>
            ) : (
              <section className="content-wrapper">
                <div className="stat-wrapper">
                  {renderInfoIcon(
                    'Treasury Balance',
                    'help:openGov:treasuryBalance'
                  )}
                  <h4>{getFormattedFreeBalance()}</h4>
                </div>
                <div className="stat-wrapper">
                  {renderInfoIcon('Next Burn', 'help:openGov:nextBurn')}
                  <h4>{getFormattedNextBurn()}</h4>
                </div>
                <div className="stat-wrapper">
                  {renderInfoIcon('To Be Awarded', 'help:openGov:toBeAwarded')}
                  <h4>{getFormattedToBeAwarded()}</h4>
                </div>
                <div className="stat-wrapper">
                  {renderInfoIcon('Spend Period', 'help:openGov:spendPeriod')}
                  <h4>{getSpendPeriodProgress()}</h4>
                </div>
              </section>
            )}
          </TreasuryStats>

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
