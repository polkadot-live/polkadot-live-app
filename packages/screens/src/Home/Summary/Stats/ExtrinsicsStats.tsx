// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useSummary } from '@polkadot-live/contexts';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

/**
 * Colors for each extrinsic status.
 */
const statusColors: Record<string, string> = {
  pending: '#d4a574',
  finalized: '#7ab89e',
};

export const ExtrinsicsStats = () => {
  const { extrinsicCounts } = useSummary();
  const [animated, setAnimated] = useState(false);

  const pending = extrinsicCounts.get('pending') ?? 0;
  const finalized = extrinsicCounts.get('finalized') ?? 0;
  const total = pending + finalized;

  const pct = (count: number) => (total === 0 ? 0 : (count / total) * 100);

  const rows = [
    { label: 'Pending', count: pending, color: statusColors.pending },
    { label: 'Finalized', count: finalized, color: statusColors.finalized },
  ];

  // Trigger animation after initial mount (mirrors Chart.js grow-in).
  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <Wrapper>
      {/* Total */}
      <TotalRow>
        <span className="value">{total}</span>
        <span className="label">Total</span>
      </TotalRow>

      {/* Status rows */}
      {rows.map(({ label, count, color }) => (
        <StatusRow key={label}>
          <RowHeader>
            <span className="title">{label}</span>
            <span className="count">{count}</span>
          </RowHeader>
          <BarTrack>
            <BarFill $pct={animated ? pct(count) : 0} $color={color} />
          </BarTrack>
        </StatusRow>
      ))}
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
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.75rem 1.25rem;
`;

const TotalRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  margin-bottom: 0.25rem;

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

const StatusRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const RowHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;

  .title {
    font-size: 1rem;
    color: var(--text-color-secondary);
  }
  .count {
    font-size: 0.94rem;
    font-weight: 600;
    color: var(--text-color-primary);
    padding-right: 0.4rem;
  }
`;

const BarTrack = styled.div`
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background-color: rgba(128, 128, 128, 0.15);
  overflow: hidden;
`;

const BarFill = styled.div<{ $pct: number; $color: string }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  border-radius: 4px;
  background-color: ${({ $color }) => $color};
  transition: width 1s cubic-bezier(0.33, 1, 0.68, 1);
`;
