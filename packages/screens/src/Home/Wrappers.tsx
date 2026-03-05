// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';
import type { ChainID } from '@polkadot-live/types';

/** Accent colors per network. */
export const networkAccentColors: Record<string, string> = {
  'Polkadot Asset Hub': '#c75d82',
  'Polkadot People': '#c75d82',
  'Kusama Asset Hub': '#6e6e6e',
  'Kusama People': '#6e6e6e',
  'Paseo Asset Hub': '#7a8fc2',
  'Paseo People': '#7a8fc2',
  'Westend Asset Hub': '#d47a7a',
  'Westend People': '#d47a7a',
};

/** Helper — resolve accent color with a fallback. */
export const getNetworkColor = (chainId: ChainID): string =>
  networkAccentColors[chainId] ?? '#888888';

/** Chevron-right indicator — nudges right on card hover. */
export const CardChevron = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: var(--text-color-secondary);
  opacity: 0.35;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
  flex-shrink: 0;
`;

/** Outer card wrapper — horizontal: icon | content column. */
export const Card = styled.div<{ $accentColor: string }>`
  position: relative;
  background-color: var(--background-primary);
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 1rem;
  overflow: hidden;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--background-primary-hover);
  }

  &:hover ${CardChevron} {
    opacity: 0.8;
    transform: translateX(2px);
  }
`;

/** Right side: stacks header row + stats row. */
export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  flex: 1;
  min-width: 0;
`;

/** Top row: name, badge, chevron. Direction is configurable. */
export const CardHeader = styled.div<{
  direction?: 'row' | 'column';
  gap?: string;
}>`
  display: flex;
  flex-direction: ${({ direction }) => (direction === 'column' ? 'column' : 'row')};
  align-items: ${({ direction }) => (direction === 'column' ? 'flex-start' : 'center')};
  gap: ${({ direction, gap }) => gap ?? (direction === 'column' ? '0.5rem' : '0.75rem')};
`;

/** Accent-coloured circle behind the chain icon. */
export const IconCircle = styled.span<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: ${({ $color }) => `${$color}22`};
  flex-shrink: 0;
  margin-right: 0.25rem;
`;

/** Network / Account name text. */
export const Title = styled.span<{ $grow: boolean }>`
  ${({ $grow }) => ($grow === false ? '' : 'flex: 1;')}
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/** Truncated subtitle text. */
export const Subtitle = styled.span`
  font-size: 0.95rem;
  color: var(--text-color-secondary);
  opacity: 0.65;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/** Bottom row: lightweight stats with accent colour. */
export const StatsRow = styled.div<{
  $color: string;
  $inactive?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.96rem;
  color: var(--text-color-secondary);
  opacity: ${({ $inactive }) => ($inactive ? 0.4 : 1)};
  transition: opacity 0.2s ease;

  .stat-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.4rem 0.7rem;
    border-radius: 0.375rem;
    background-color: ${({ $color }) => `${$color}20`};
    font-size: 0.92rem;
  }

  .stat-value {
    font-weight: 700;
    color: ${({ $color }) => $color};
  }
`;

/** Pill-shaped subscription count badge. */
export const CountBadge = styled.span<{
  $color: string;
  $active: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 24px;
  padding: 0 0.55rem;
  border-radius: 999px;
  background-color: ${({ $color, $active }) =>
    $active ? `${$color}22` : 'var(--background-default)'};
  color: ${({ $color, $active }) => ($active ? $color : 'var(--text-color-tertiary)')};
  font-size: 0.88rem;
  font-weight: 700;
  flex-shrink: 0;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
`;

export default {};
