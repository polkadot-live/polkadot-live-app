// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import * as Styles from '@polkadot-live/ui/styles';
import * as themeVariables from '../../../theme/variables';

import { renderPlaceholders } from '@polkadot-live/ui/utils';
import { TooltipWrapper } from '@app/Utils';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { TreasuryStats } from '../Wrappers';
import { useConnections } from '@app/contexts/common/Connections';
import { useHelp } from '@app/contexts/common/Help';
import { useTreasury } from '@app/contexts/openGov/Treasury';
import type { ChainID } from '@polkadot-live/types/chains';

export const OverviewTreasury: React.FC = () => {
  const { openHelp } = useHelp();
  const { darkMode, getOnlineMode } = useConnections();
  const theme = darkMode ? themeVariables.darkTheme : themeVariables.lightThene;

  // Treasury context.
  const {
    fetchingTreasuryData,
    treasuryChainId,
    initTreasury,
    refetchStats,
    getFormattedFreeBalance,
    getFormattedNextBurn,
    getFormattedToBeAwarded,
    getSpendPeriodProgress,
  } = useTreasury();

  // Handle changing treasury stats.
  const handleChangeStats = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const target = event.target.value as ChainID;
    if (target !== treasuryChainId) {
      initTreasury(target);
    }
  };

  // Re-fetch treasury stats when user clicks refresh button.
  const refetchTreasuryStats = () => {
    refetchStats();
  };

  return (
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
  );
};
