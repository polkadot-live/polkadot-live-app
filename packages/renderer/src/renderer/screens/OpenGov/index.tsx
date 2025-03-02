// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import * as Styles from '@polkadot-live/ui/styles';

import PolkadotSVG from '@app/svg/polkadotIcon.svg?react';
import KusamaSVG from '@app/svg/kusamaIcon.svg?react';
import { Config as ConfigOpenGov } from '@ren/config/processes/openGov';
import { WindowWrapper } from '@app/screens/Wrappers';
import { useOpenGovMessagePorts } from '@app/hooks/useOpenGovMessagePorts';
import { useEffect, useState } from 'react';
import {
  ModalSection,
  ModalMotionTwoSection,
} from '@polkadot-live/ui/kits/overlay';
import { Tracks } from './Tracks';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { useTracks } from '@app/contexts/openGov/Tracks';
import { Referenda } from './Referenda';
import { useConnections } from '@app/contexts/common/Connections';
import { useReferenda } from '@app/contexts/openGov/Referenda';
import { useTooltip } from '@polkadot-live/ui/contexts';
import { useTreasury } from '@app/contexts/openGov/Treasury';
import { TreasuryStats } from './Wrappers';
import { useDebug } from '@app/hooks/useDebug';
import { useHelp } from '@app/contexts/common/Help';
import { renderPlaceholders } from '@polkadot-live/ui/utils';
import type { ChainID } from '@polkadot-live/types/chains';
import { LinksFooter } from '@app/Utils';

export const OpenGov: React.FC = () => {
  /// Set up port communication for `openGov` window.
  useOpenGovMessagePorts();
  useDebug(window.myAPI.getWindowId());

  /// Connection status.
  const { getOnlineMode } = useConnections();

  /// Open help function.
  const { openHelp } = useHelp();

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
          getOnlineMode() && initTreasury(treasuryChainId);
        }
      }, 1_000);
    } else {
      getOnlineMode() && initTreasury(treasuryChainId);
    }

    const applyBorders = () => {
      const cards = document.querySelectorAll(
        '.methodCard'
      ) as NodeListOf<HTMLElement>;

      cards.forEach((card, i) => {
        if (i === 0) {
          card.style.borderTopLeftRadius = '0.375rem';
          card.style.borderBottomLeftRadius = '0.375rem';
        } else if (i === 1) {
          card.style.borderTopRightRadius = '0.375rem';
          card.style.borderBottomRightRadius = '0.375rem';
        } else if (i === 2) {
          card.style.borderTopLeftRadius = '0.375rem';
          card.style.borderBottomLeftRadius = '0.375rem';
        } else if (i === 3) {
          card.style.borderTopRightRadius = '0.375rem';
          card.style.borderBottomRightRadius = '0.375rem';
        }
      });
    };

    applyBorders();
  }, []);

  /// Reload treasury data if app goes online from offline mode.
  useEffect(() => {
    if (getOnlineMode()) {
      initTreasury(treasuryChainId);
    }
  }, [getOnlineMode()]);

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

  /// Handle changing treasury stats.
  const handleChangeStats = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const target = event.target.value as ChainID;
    if (target !== treasuryChainId) {
      initTreasury(target);
    }
  };

  return (
    <ModalSection type="carousel" style={{ height: '100%' }}>
      <ModalMotionTwoSection
        style={{ height: '100%' }}
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
        <section
          className="carousel-section-wrapper"
          style={{ height: '100%' }}
        >
          <UI.ScrollableMax
            headerHeight={0}
            footerHeight={0}
            style={{ padding: 0 }}
          >
            <WindowWrapper style={{ paddingTop: '1rem' }}>
              <Styles.FlexColumn>
                <UI.ActionItem
                  showIcon={false}
                  text={'Treasury'}
                  style={{ marginTop: '0.75rem' }}
                />

                <TreasuryStats $chainId={treasuryChainId}>
                  {fetchingTreasuryData && getOnlineMode() ? (
                    <div className="loading-wrapper">
                      {renderPlaceholders(0, '68.47px', '0.5rem')}
                    </div>
                  ) : (
                    <Styles.FlexColumn>
                      <UI.ControlsWrapper style={{ marginBottom: '0' }}>
                        {/* Re-fetch Stats */}
                        <div
                          className="tooltip-trigger-element"
                          data-tooltip-text={
                            getOnlineMode()
                              ? 'Refresh Stats'
                              : 'Currently Offline'
                          }
                          onMouseMove={() =>
                            setTooltipTextAndOpen(
                              getOnlineMode()
                                ? 'Refresh Stats'
                                : 'Currently Offline'
                            )
                          }
                        >
                          <UI.SortControlButton
                            isActive={true}
                            isDisabled={
                              fetchingTreasuryData || !getOnlineMode()
                            }
                            onClick={() => refetchTreasuryStats()}
                            faIcon={faArrowsRotate}
                            fixedWidth={false}
                          />
                        </div>

                        {/* Select Box */}
                        {wrapWithOfflineTooltip(
                          <div className="select-wrapper">
                            <select
                              disabled={!getOnlineMode()}
                              id="select-treasury-chain"
                              value={treasuryChainId}
                              onChange={(e) => handleChangeStats(e)}
                            >
                              <option value="Polkadot">Polkadot</option>
                              <option value="Kusama">Kusama</option>
                            </select>
                          </div>,
                          getOnlineMode()
                        )}
                      </UI.ControlsWrapper>

                      {wrapWithOfflineTooltip(
                        <Styles.GridFourCol id="OpenGovStats">
                          <UI.TreasuryStatCard
                            chainId={treasuryChainId}
                            title={'Treasury Balance'}
                            statText={getFormattedFreeBalance()}
                            helpKey={'help:openGov:treasuryBalance'}
                            openHelp={openHelp}
                          />
                          <UI.TreasuryStatCard
                            chainId={treasuryChainId}
                            title={'Next Burn'}
                            statText={getFormattedNextBurn()}
                            helpKey={'help:openGov:nextBurn'}
                            openHelp={openHelp}
                          />
                          <UI.TreasuryStatCard
                            chainId={treasuryChainId}
                            title={'To Be Awarded'}
                            statText={getFormattedToBeAwarded()}
                            helpKey={'help:openGov:toBeAwarded'}
                            openHelp={openHelp}
                          />
                          <UI.TreasuryStatCard
                            chainId={treasuryChainId}
                            title={'Spend Period'}
                            statText={getSpendPeriodProgress()}
                            helpKey={'help:openGov:spendPeriod'}
                            openHelp={openHelp}
                          />
                        </Styles.GridFourCol>,
                        getOnlineMode()
                      )}
                    </Styles.FlexColumn>
                  )}
                </TreasuryStats>
              </Styles.FlexColumn>
            </WindowWrapper>

            <WindowWrapper>
              {/* Referenda */}
              <Styles.FlexColumn $rowGap={'0.75rem'}>
                <UI.ActionItem
                  showIcon={false}
                  text={'Referenda'}
                  style={{ marginTop: '0.75rem' }}
                />
                <Styles.GridTwoCol>
                  <UI.NavCardThin
                    title={'Polkadot'}
                    onClick={() => handleOpenReferenda('Polkadot')}
                    childrenLogo={
                      <PolkadotSVG width={'1.5rem'} opacity={0.8} />
                    }
                    childrenSubtitle={
                      <span>Active referenda on the Polkadot network.</span>
                    }
                  />
                  <UI.NavCardThin
                    title={'Kusama'}
                    onClick={() => handleOpenReferenda('Kusama')}
                    childrenLogo={<KusamaSVG width={'2.2rem'} opacity={0.8} />}
                    childrenSubtitle={
                      <span>Active referenda on the Kusama network.</span>
                    }
                  />
                </Styles.GridTwoCol>

                {/* Origins and Tracks */}
                <UI.ActionItem
                  showIcon={false}
                  text={'Tracks'}
                  style={{ marginTop: '0.75rem' }}
                />
                <Styles.GridTwoCol>
                  <UI.NavCardThin
                    title={'Polkadot'}
                    onClick={() => handleOpenTracks('Polkadot')}
                    childrenLogo={
                      <PolkadotSVG width={'1.5rem'} opacity={0.8} />
                    }
                    childrenSubtitle={
                      <span>Tracks on the Polkadot network.</span>
                    }
                  />
                  <UI.NavCardThin
                    title={'Kusama'}
                    onClick={() => handleOpenTracks('Kusama')}
                    childrenLogo={<KusamaSVG width={'2.2rem'} opacity={0.8} />}
                    childrenSubtitle={
                      <span>Tracks on the Kusama network.</span>
                    }
                  />
                </Styles.GridTwoCol>
              </Styles.FlexColumn>
            </WindowWrapper>
            <LinksFooter />
          </UI.ScrollableMax>
        </section>

        {/* Section 2 */}
        <section
          className="carousel-section-wrapper"
          style={{ height: '100%' }}
        >
          {sectionContent === 'tracks' && <Tracks setSection={setSection} />}
          {sectionContent === 'referenda' && (
            <Referenda setSection={setSection} />
          )}
        </section>
      </ModalMotionTwoSection>
    </ModalSection>
  );
};
