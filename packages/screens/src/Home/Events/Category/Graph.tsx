// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useConnections } from '@polkadot-live/contexts';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { categoryColors } from '../../Wrappers';
import type { EventCategory } from '@polkadot-live/types';

ChartJS.register(
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
);

/** Generate last‑10‑day labels (short month + day). */
const makeLast10DayLabels = (): string[] => {
  const labels: string[] = [];
  const today = new Date();

  for (let i = 9; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    labels.push(
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    );
  }

  return labels;
};

interface CategoryItemGraphProps {
  category: EventCategory;
  dailyCounts: number[];
}

export const CategoryItemGraph = ({
  category,
  dailyCounts,
}: CategoryItemGraphProps) => {
  const { cacheGet } = useConnections();
  const darkMode = cacheGet('mode:dark');

  const color = categoryColors[category];
  const labels = makeLast10DayLabels();
  const values = dailyCounts;

  const data = {
    labels,
    datasets: [
      {
        data: values,
        borderColor: darkMode ? `${color}99` : color,
        backgroundColor: `${color}18`,
        borderWidth: 1.5,
        pointRadius: 0,
        pointHitRadius: 8,
        pointHoverRadius: 3.5,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        displayColors: false,
        backgroundColor: 'rgba(30,30,30,0.85)',
        titleFont: { size: 10 },
        bodyFont: { size: 11, weight: 'bold' as const },
        padding: 6,
        cornerRadius: 6,
        callbacks: {
          title: (items: { dataIndex: number }[]) => labels[items[0].dataIndex],
          label: (item: { raw: unknown }) => `${item.raw} events`,
        },
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
        beginAtZero: true,
      },
    },
  } as const;

  return <Line data={data} options={options} />;
};
