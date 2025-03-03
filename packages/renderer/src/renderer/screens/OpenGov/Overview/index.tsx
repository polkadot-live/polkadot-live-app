// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import * as Styles from '@polkadot-live/ui/styles';
import * as themeVariables from '../../../theme/variables';
import PolkadotSVG from '@app/svg/polkadotIcon.svg?react';
import KusamaSVG from '@app/svg/kusamaIcon.svg?react';

import { renderPlaceholders } from '@polkadot-live/ui/utils';
import { TooltipWrapper } from '@app/Utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowsRotate,
  faFilePen,
  faList,
} from '@fortawesome/free-solid-svg-icons';
import { NetworkHeader, TreasuryStats } from '../Wrappers';
import { useConnections } from '@app/contexts/common/Connections';
import { useEffect } from 'react';
import { useHelp } from '@app/contexts/common/Help';
import { useReferenda } from '@app/contexts/openGov/Referenda';
import { useTracks } from '@app/contexts/openGov/Tracks';
import { useTreasury } from '@app/contexts/openGov/Treasury';
import type { ChainID } from '@polkadot-live/types/chains';
import type { OverviewProps } from './types';

export const Overview: React.FC<OverviewProps> = ({
  setSection,
  setSectionContent,
}: OverviewProps) => {
  const { openHelp } = useHelp();

  /**
   * Theme object.
   */
  const { darkMode, getOnlineMode } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

  /**
   * Treasury context.
   */
  const {
    fetchingTreasuryData,
    treasuryChainId,
    getFormattedFreeBalance,
    getFormattedNextBurn,
    getFormattedToBeAwarded,
    getSpendPeriodProgress,
    initTreasury,
    refetchStats,
  } = useTreasury();

  /**
   * Tracks and referenda contexts.
   */
  const { fetchTracksData } = useTracks();
  const { fetchReferendaData } = useReferenda();

  /**
   * Open origins and tracks information.
   */
  const handleOpenTracks = (chainId: ChainID) => {
    setSectionContent('tracks');
    fetchTracksData(chainId);
    setSection(1);
  };

  /**
   * Re-fetch treasury stats when user clicks refresh button.
   */
  const refetchTreasuryStats = () => {
    refetchStats();
  };

  /**
   * Open referenda.
   */
  const handleOpenReferenda = (chainId: ChainID) => {
    setSectionContent('referenda');
    fetchReferendaData(chainId);
    setSection(1);
  };

  /**
   * Handle changing treasury stats.
   */
  const handleChangeStats = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const target = event.target.value as ChainID;
    if (target !== treasuryChainId) {
      initTreasury(target);
    }
  };

  /**
   * Apply border radius to navigation cards.
   */
  useEffect(() => {
    const applyBorders = () => {
      const cards = document.querySelectorAll(
        '.methodCard'
      ) as NodeListOf<HTMLElement>;

      cards.forEach((card, i) => {
        if (i === 2) {
          card.style.borderBottomLeftRadius = '0.375rem';
        } else if (i === 3) {
          card.style.borderBottomRightRadius = '0.375rem';
        }
      });
    };

    applyBorders();
  }, []);

  return (
    <Styles.FlexColumn $rowGap={'2rem'}>
      <section>
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
                  <UI.TooltipRx
                    theme={theme}
                    text={getOnlineMode() ? 'Refresh Stats' : 'Offline'}
                  >
                    <span>
                      <UI.SortControlButton
                        isActive={true}
                        isDisabled={fetchingTreasuryData || !getOnlineMode()}
                        onClick={() => refetchTreasuryStats()}
                        faIcon={faArrowsRotate}
                        fixedWidth={false}
                      />
                    </span>
                  </UI.TooltipRx>

                  {/* Select Box */}
                  <TooltipWrapper
                    theme={theme}
                    wrap={!getOnlineMode()}
                    tooltipText={'Offline'}
                  >
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
                    </div>
                  </TooltipWrapper>
                </UI.ControlsWrapper>

                <TooltipWrapper
                  theme={theme}
                  wrap={!getOnlineMode()}
                  tooltipText={'Offline'}
                >
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
                  </Styles.GridFourCol>
                </TooltipWrapper>
              </Styles.FlexColumn>
            )}
          </TreasuryStats>
        </Styles.FlexColumn>
      </section>

      <section>
        {/* Referenda */}
        <UI.ActionItem showIcon={false} text={'Explore OpenGov'} />
        <Styles.FlexColumn $rowGap={'0.25rem'}>
          <Styles.FlexRow $gap={'0.25rem'} style={{ marginTop: '1rem' }}>
            <NetworkHeader style={{ borderTopLeftRadius: '0.375rem' }}>
              <PolkadotSVG width={'1.25rem'} opacity={0.8} />
              <h4>Polkadot</h4>
            </NetworkHeader>
            <NetworkHeader style={{ borderTopRightRadius: '0.375rem' }}>
              <KusamaSVG width={'2.2rem'} opacity={0.8} />
              <h4>Kusama</h4>
            </NetworkHeader>
          </Styles.FlexRow>
          <Styles.GridTwoCol>
            <UI.NavCardThin
              title={'Referenda'}
              styleLogoCont={{ opacity: '0.8' }}
              onClick={() => handleOpenReferenda('Polkadot')}
              childrenLogo={
                <FontAwesomeIcon icon={faFilePen} transform={'grow-3'} />
              }
              childrenSubtitle={
                <span>Active referenda on the Polkadot network.</span>
              }
            />
            <UI.NavCardThin
              title={'Referenda'}
              styleLogoCont={{ opacity: '0.8' }}
              onClick={() => handleOpenReferenda('Kusama')}
              childrenLogo={
                <FontAwesomeIcon icon={faFilePen} transform={'grow-3'} />
              }
              childrenSubtitle={
                <span>Active referenda on the Kusama network.</span>
              }
            />
            <UI.NavCardThin
              title={'Tracks'}
              onClick={() => handleOpenTracks('Polkadot')}
              childrenLogo={
                <FontAwesomeIcon icon={faList} transform={'grow-2'} />
              }
              childrenSubtitle={<span>Tracks on the Polkadot network.</span>}
            />
            <UI.NavCardThin
              title={'Tracks'}
              onClick={() => handleOpenTracks('Kusama')}
              childrenLogo={
                <FontAwesomeIcon icon={faList} transform={'grow-2'} />
              }
              childrenSubtitle={<span>Tracks on the Kusama network.</span>}
            />
          </Styles.GridTwoCol>
        </Styles.FlexColumn>
      </section>
    </Styles.FlexColumn>
  );
};
