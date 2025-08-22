// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as UI from '@polkadot-live/ui/components';
import * as Styles from '@polkadot-live/ui/styles';

import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { TreasuryStats } from '../Wrappers';
import { useConnections, useHelp } from '@ren/contexts/common';
import { useTreasury } from '@ren/contexts/openGov';
import type { ChainID } from '@polkadot-live/types/chains';

export const OverviewTreasury: React.FC = () => {
  const { openHelp } = useHelp();
  const { getTheme, getOnlineMode } = useConnections();
  const theme = getTheme();

  // Treasury context.
  const {
    fetchingTreasuryData,
    hasFetched,
    treasuryChainId,
    initTreasury,
    refetchStats,
    getFormattedFreeBalance,
    getFormattedHubBalance,
    getFormattedNextBurn,
    getFormattedToBeAwarded,
    getSpendPeriodProgress,
  } = useTreasury();

  // Flag to control disabled stat styling.
  const statDisabled =
    (!getOnlineMode() && !hasFetched) || fetchingTreasuryData;

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
          <Styles.FlexColumn>
            <UI.ControlsWrapper style={{ marginBottom: '0' }}>
              <Styles.FlexRow>
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
                <UI.TooltipWrapper
                  theme={theme}
                  wrap={!getOnlineMode()}
                  tooltipText={'Offline'}
                >
                  <div className="select-wrapper">
                    <select
                      disabled={!getOnlineMode() || fetchingTreasuryData}
                      id="select-treasury-chain"
                      value={treasuryChainId}
                      onChange={(e) => handleChangeStats(e)}
                    >
                      <option value="Polkadot Relay">Polkadot</option>
                      <option value="Kusama Relay">Kusama</option>
                    </select>
                  </div>
                </UI.TooltipWrapper>
              </Styles.FlexRow>
            </UI.ControlsWrapper>

            <Styles.FlexColumn $rowGap="2px">
              <Styles.GridFourCol
                id="OpenGovStats"
                $roundBottonBorder={treasuryChainId === 'Kusama Relay'}
              >
                <UI.TreasuryStatCard
                  chainId={treasuryChainId}
                  title={'Treasury Balance'}
                  statText={getFormattedFreeBalance()}
                  helpKey={'help:openGov:treasuryBalance'}
                  openHelp={openHelp}
                  disable={statDisabled}
                />
                <UI.TreasuryStatCard
                  chainId={treasuryChainId}
                  title={'Next Burn'}
                  statText={getFormattedNextBurn()}
                  helpKey={'help:openGov:nextBurn'}
                  openHelp={openHelp}
                  disable={statDisabled}
                />
                <UI.TreasuryStatCard
                  chainId={treasuryChainId}
                  title={'To Be Awarded'}
                  statText={getFormattedToBeAwarded()}
                  helpKey={'help:openGov:toBeAwarded'}
                  openHelp={openHelp}
                  disable={statDisabled}
                />
                <UI.TreasuryStatCard
                  chainId={treasuryChainId}
                  title={'Spend Period'}
                  statText={getSpendPeriodProgress()}
                  helpKey={'help:openGov:spendPeriod'}
                  openHelp={openHelp}
                  disable={statDisabled}
                />
              </Styles.GridFourCol>

              {treasuryChainId === 'Polkadot Relay' && (
                <Styles.FlexRow className="PolkadotHubStats">
                  <Styles.FlexColumn $rowGap={'0.2rem'}>
                    <h2 className="Heading">{'Polkadot Asset Hub'}</h2>
                    <Styles.FlexRow>
                      <UI.TreasuryBalanceCard
                        chainId={treasuryChainId}
                        symbol={'DOT'}
                        balance={getFormattedHubBalance('DOT')}
                        disable={statDisabled}
                      />
                      <UI.TreasuryBalanceCard
                        chainId={treasuryChainId}
                        symbol={'USDC'}
                        balance={getFormattedHubBalance('USDC')}
                        disable={statDisabled}
                      />
                      <UI.TreasuryBalanceCard
                        chainId={treasuryChainId}
                        symbol={'USDT'}
                        balance={getFormattedHubBalance('USDT')}
                        disable={statDisabled}
                      />
                    </Styles.FlexRow>
                  </Styles.FlexColumn>
                </Styles.FlexRow>
              )}

              {treasuryChainId === 'Kusama Relay' && (
                <Styles.FlexRow className="PolkadotHubStats">
                  <Styles.FlexColumn $rowGap={'0.2rem'}>
                    <h2 className="Heading">{'Kusama Asset Hub'}</h2>
                    <Styles.FlexRow>
                      <UI.TreasuryBalanceCard
                        chainId={treasuryChainId}
                        symbol={'KSM'}
                        balance={getFormattedHubBalance('KSM')}
                        disable={statDisabled}
                      />
                    </Styles.FlexRow>
                  </Styles.FlexColumn>
                </Styles.FlexRow>
              )}
            </Styles.FlexColumn>
          </Styles.FlexColumn>
        </TreasuryStats>
      </Styles.FlexColumn>
    </section>
  );
};
