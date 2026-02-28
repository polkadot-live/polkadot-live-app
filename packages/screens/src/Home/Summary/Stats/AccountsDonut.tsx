// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getSupportedSources } from '@polkadot-live/consts/chains';
import { useSummary } from '@polkadot-live/contexts';
import { getReadableAccountSource } from '@polkadot-live/core';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import styled from 'styled-components';
import type { AccountSource } from '@polkadot-live/types/accounts';

ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Color mapping for each import source.
 */
const sourceColors: Record<AccountSource, string> = {
  ledger: '#a78bda',
  'read-only': '#6ec4c4',
  vault: '#d4a574',
  'wallet-connect': '#7ab89e',
  system: '#8e99a4',
};

export const AccountsDonut = () => {
  const { addressMap } = useSummary();
  const sources = getSupportedSources();

  const labels = sources.map((s) => getReadableAccountSource(s));
  const counts = sources.map((s) => (addressMap.get(s) ?? []).length);
  const total = counts.reduce((sum, c) => sum + c, 0);
  const colors = sources.map((s) => sourceColors[s]);

  const data = {
    labels,
    datasets: [
      {
        data: total === 0 ? [1] : counts,
        backgroundColor: total === 0 ? ['rgba(150, 150, 150, 0.15)'] : colors,
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    cutout: '68%',
    responsive: true,
    spacing: 2,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: total > 0, boxPadding: 8 },
    },
  } as const;

  return (
    <Wrapper>
      <ChartContainer>
        <Doughnut data={data} options={options} />
        <CenterLabel>
          <span className="value">{total}</span>
          <span className="label">Total</span>
        </CenterLabel>
      </ChartContainer>

      <LegendList>
        {sources.map((source, i) => (
          <LegendItem key={source}>
            <Swatch $color={colors[i]} />
            <span className="legend-label">{labels[i]}</span>
            <span className="legend-count">{counts[i]}</span>
          </LegendItem>
        ))}
      </LegendList>
    </Wrapper>
  );
};

/* ------------------------------------------------------------------ */
/*  Styled components                                                  */
/* ------------------------------------------------------------------ */

const Wrapper = styled.div`
  background-color: var(--background-primary);
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 1.75rem 1rem;
`;

const ChartContainer = styled.div`
  position: relative;
  width: 140px;
  height: 140px;
  flex-shrink: 0;
`;

const CenterLabel = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  .value {
    color: var(--text-color-primary);
    font-size: 1.6rem;
    font-weight: 700;
    line-height: 1;
  }
  .label {
    color: var(--text-color-secondary);
    font-size: 1.1rem;
    font-weight: 500;
    margin-top: 0.15rem;
  }
`;

const LegendList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .legend-label {
    flex: 1;
    padding-right: 1rem;
    font-size: 1rem;
    color: var(--text-color-secondary);
  }
  .legend-count {
    font-size: 0.94rem;
    font-weight: 600;
    color: var(--text-color-primary);
  }
`;

const Swatch = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  flex-shrink: 0;
`;
