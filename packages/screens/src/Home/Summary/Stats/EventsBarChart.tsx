// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getAllEventCategories } from '@polkadot-live/consts/chains';
import { useConnections, useEvents } from '@polkadot-live/contexts';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import styled from 'styled-components';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

/**
 * Color mapping for each event category.
 */
const categoryColors: Record<string, string> = {
  Balances: '#a78bda',
  Nominating: '#6ec4c4',
  'Nomination Pools': '#d4a574',
  OpenGov: '#7ab89e',
  Voting: '#cf8e8e',
};

export const EventsBarChart = () => {
  const { getEventsCount } = useEvents();
  const { cacheGet } = useConnections();

  const darkMode = cacheGet('mode:dark');
  const categories = getAllEventCategories().filter((c) => c !== 'Debugging');
  const counts = categories.map((c) => getEventsCount(c));
  const total = counts.reduce((sum, n) => sum + n, 0);
  const colors = categories.map((c) => categoryColors[c]);

  const data = {
    labels: categories,
    datasets: [
      {
        data: counts,
        backgroundColor: colors,
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        boxPadding: 8,
        callbacks: {
          title: (items: { dataIndex: number }[]) =>
            categories[items[0].dataIndex],
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { display: false },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: darkMode
            ? 'rgba(180, 180, 180, 0.45)'
            : 'rgba(118, 118, 118, 0.75)',
          precision: 0,
          font: { size: 11 },
          maxTicksLimit: 5,
        },
        grid: { color: 'rgba(128, 128, 128, 0.12)' },
        border: { display: false },
      },
    },
  } as const;

  return (
    <Wrapper>
      {/* Bar chart */}
      <ChartContainer>
        <Bar data={data} options={options} />
      </ChartContainer>

      {/* Legend + total */}
      <LegendContainer>
        <TotalRow>
          <span className="value">{total}</span>
          <span className="label">Total</span>
        </TotalRow>

        <LegendList>
          {categories.map((category, i) => (
            <LegendItem key={category}>
              <Swatch $color={colors[i]} />
              <span className="legend-label">{category}</span>
              <span className="legend-count">{counts[i]}</span>
            </LegendItem>
          ))}
        </LegendList>
      </LegendContainer>
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
  width: 180px;
  height: 150px;
  flex-shrink: 0;
`;

const LegendContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TotalRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.6rem;

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
    text-align: right;
    min-width: 1.5rem;
    font-size: 1rem;
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
