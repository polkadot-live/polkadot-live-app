// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import PolkadotSVG from '@app/svg/polkadotIcon.svg?react';
import KusamaSVG from '@app/svg/kusamaIcon.svg?react';
import { DragClose } from '@/renderer/library/DragClose';
import { Config as ConfigOpenGov } from '@/config/processes/openGov';
import { ContentWrapper, HeaderWrapper } from '@app/screens/Wrappers';
import { useOpenGovMessagePorts } from '@/renderer/hooks/useOpenGovMessagePorts';
import { useEffect, useState } from 'react';
import { ModalSection } from '@/renderer/kits/Overlay/structure/ModalSection';
import { ModalMotionTwoSection } from '@/renderer/kits/Overlay/structure/ModalMotionTwoSection';
import { Tracks } from './Tracks';
import { ActionItem } from '@/renderer/library/ActionItem';
import {
  faCaretRight,
  faInfo,
  faArrowsRotate,
} from '@fortawesome/free-solid-svg-icons';
import { useTracks } from '@/renderer/contexts/openGov/Tracks';
import { Referenda } from './Referenda';
import { useConnections } from '@/renderer/contexts/common/Connections';
import { useReferenda } from '@/renderer/contexts/openGov/Referenda';
import { useTooltip } from '@/renderer/contexts/common/Tooltip';
import { useTreasury } from '@/renderer/contexts/openGov/Treasury';
import { IconWrapper, OpenGovCard, TreasuryStats } from './Wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useHelp } from '@/renderer/contexts/common/Help';
import type { ChainID } from '@/types/chains';
import type { HelpItemKey } from '@/renderer/contexts/common/Help/types';
import {
  StatsFooter,
  ControlsWrapper,
  SortControlButton,
  renderPlaceholders,
} from '@/renderer/utils/common';

export const OpenGov: React.FC = () => {
  /// Set up port communication for `openGov` window.
  useOpenGovMessagePorts();

  /// Connection status.
  const { isConnected } = useConnections();

  /// Treasury context.
  const {
    fetchingTreasuryData,
    treasuryChainId,
    initTreasury,
    getFormattedFreeBalance,
    getFormattedNextBurn,
    getFormattedToBeAwarded,
    getSpendPeriodProgress,
    refetchStats,
  } = useTreasury();

  /// Help overlay and tooltip.
  const { openHelp } = useHelp();
  const { setTooltipTextAndOpen, wrapWithOfflineTooltip } = useTooltip();

  /// Tracks and referenda contexts.
  const { fetchTracksData } = useTracks();
  const { fetchReferendaData } = useReferenda();

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
          isConnected && initTreasury(treasuryChainId);
        }
      }, 1_000);
    } else {
      isConnected && initTreasury(treasuryChainId);
    }
  }, []);

  /// Reload treasury data if app goes online from offline mode.
  useEffect(() => {
    if (isConnected) {
      initTreasury(treasuryChainId);
    }
  }, [isConnected]);

  /// Open origins and tracks information.
  const handleOpenTracks = (chainId: ChainID) => {
    setSectionContent('tracks');
    fetchTracksData(chainId);
    setSection(1);
  };

  /// Re-fetch treasury stats when user clicks refresh button.
  const refetchTreasuryStats = () => {
    refetchStats();
  };

  /// Open referenda.
  const handleOpenReferenda = (chainId: ChainID) => {
    setSectionContent('referenda');
    fetchReferendaData(chainId);
    setSection(1);
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

  /// Handle changing treasury stats.
  const handleChangeStats = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const target = event.target.value as ChainID;
    if (target !== treasuryChainId) {
      initTreasury(target);
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

          <TreasuryStats $chainId={treasuryChainId}>
            {fetchingTreasuryData && isConnected ? (
              <div className="loading-wrapper">
                {renderPlaceholders(0, '68.47px', '0.5rem')}
              </div>
            ) : (
              <>
                {wrapWithOfflineTooltip(
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
                      {renderInfoIcon(
                        'To Be Awarded',
                        'help:openGov:toBeAwarded'
                      )}
                      <h4>{getFormattedToBeAwarded()}</h4>
                    </div>
                    <div className="stat-wrapper">
                      {renderInfoIcon(
                        'Spend Period',
                        'help:openGov:spendPeriod'
                      )}
                      <h4>{getSpendPeriodProgress()}</h4>
                    </div>
                  </section>,
                  isConnected
                )}
              </>
            )}
          </TreasuryStats>

          <ContentWrapper>
            {/* Origins and Tracks */}
            <ActionItem text={'Tracks'} />
            <div className="grid-wrapper" style={{ marginBottom: '1.5rem' }}>
              <OpenGovCard onClick={() => handleOpenTracks('Polkadot')}>
                <IconWrapper className="hover" $chainId={'Polkadot'}>
                  <PolkadotSVG
                    width={60}
                    opacity={0.06}
                    className="svg-wrapper"
                  />
                </IconWrapper>
                <div className="content-wrapper">
                  <h4 className="btn-polkadot">
                    <span>
                      <FontAwesomeIcon icon={faCaretRight} />
                    </span>
                    On Polkadot
                  </h4>
                </div>
              </OpenGovCard>
              <OpenGovCard onClick={() => handleOpenTracks('Kusama')}>
                <IconWrapper className="hover" $chainId={'Kusama'}>
                  <KusamaSVG
                    width={100}
                    opacity={0.06}
                    className="svg-wrapper"
                  />
                </IconWrapper>
                <div className="content-wrapper">
                  <h4 className="btn-kusama">
                    <span>
                      <FontAwesomeIcon icon={faCaretRight} />
                    </span>
                    On Kusama
                  </h4>
                </div>
              </OpenGovCard>
            </div>

            {/* Proposals */}
            <ActionItem text={'Referenda'} />
            <div className="grid-wrapper">
              <OpenGovCard onClick={() => handleOpenReferenda('Polkadot')}>
                <IconWrapper className="hover" $chainId={'Polkadot'}>
                  <PolkadotSVG
                    width={60}
                    opacity={0.06}
                    className="svg-wrapper"
                  />
                </IconWrapper>
                <div className="content-wrapper">
                  <h4 className="btn-polkadot">
                    <span>
                      <FontAwesomeIcon icon={faCaretRight} />
                    </span>
                    On Polkadot
                  </h4>
                </div>
              </OpenGovCard>
              <OpenGovCard onClick={() => handleOpenReferenda('Kusama')}>
                <IconWrapper className="hover" $chainId={'Kusama'}>
                  <KusamaSVG
                    width={100}
                    opacity={0.06}
                    className="svg-wrapper"
                  />
                </IconWrapper>
                <div className="content-wrapper">
                  <h4 className="btn-kusama">
                    <span>
                      <FontAwesomeIcon icon={faCaretRight} />
                    </span>
                    On Kusama
                  </h4>
                </div>
              </OpenGovCard>
            </div>
          </ContentWrapper>

          <StatsFooter $chainId={'Polkadot'}>
            <div>
              <section className="left">
                <div className="footer-stat" style={{ columnGap: '0' }}>
                  <h2>Treasury Stats:</h2>
                  <span style={{ marginLeft: '1rem' }}>
                    <ControlsWrapper style={{ marginBottom: '0' }}>
                      {/* Select Box */}
                      {wrapWithOfflineTooltip(
                        <div className="select-wrapper">
                          <select
                            disabled={!isConnected}
                            id="select-treasury-chain"
                            value={treasuryChainId}
                            onChange={(e) => handleChangeStats(e)}
                          >
                            <option value="Polkadot">Polkadot</option>
                            <option value="Kusama">Kusama</option>
                          </select>
                        </div>,
                        isConnected
                      )}

                      {/* Re-fetch Stats */}
                      <div
                        className="tooltip-trigger-element"
                        data-tooltip-text={
                          isConnected ? 'Refresh Stats' : 'Currently Offline'
                        }
                        onMouseMove={() =>
                          setTooltipTextAndOpen(
                            isConnected ? 'Refresh Stats' : 'Currently Offline'
                          )
                        }
                      >
                        <SortControlButton
                          isActive={true}
                          isDisabled={fetchingTreasuryData || !isConnected}
                          onClick={() => refetchTreasuryStats()}
                          faIcon={faArrowsRotate}
                          fixedWidth={false}
                        />
                      </div>
                    </ControlsWrapper>
                  </span>
                </div>
              </section>
            </div>
          </StatsFooter>
        </section>

        {/* Section 2 */}
        <section className="carousel-section-wrapper">
          {sectionContent === 'tracks' && <Tracks setSection={setSection} />}
          {sectionContent === 'referenda' && (
            <Referenda setSection={setSection} />
          )}
        </section>
      </ModalMotionTwoSection>
    </ModalSection>
  );
};
