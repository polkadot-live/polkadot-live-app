// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

/** Chevron-right indicator — nudges right on card hover. */
export const AccountChevron = styled.span`
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

/** Outer card wrapper — horizontal: identicon | content column | badge | chevron. */
export const AccountCard = styled.div<{ $accentColor: string }>`
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

  &:hover ${AccountChevron} {
    opacity: 0.8;
    transform: translateX(2px);
  }
`;

/** Accent-coloured circle behind the identicon. */
export const AccountIconCircle = styled.span<{ $color: string }>`
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

/** Right side: stacks header (name + address) + stats row. */
export const AccountCardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  flex: 1;
  min-width: 0;
`;

/** Top section: account name + truncated address subtitle. */
export const AccountCardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

/** Account name text. */
export const AccountName = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/** Truncated address subtitle. */
export const AccountAddress = styled.span`
  font-size: 0.95rem;
  color: var(--text-color-secondary);
  opacity: 0.65;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/** Bottom row: lightweight stats with accent colour. */
export const AccountStatsRow = styled.div<{
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
export const AccountCountBadge = styled.span<{
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
  color: ${({ $color, $active }) =>
    $active ? $color : 'var(--text-color-tertiary)'};
  font-size: 0.88rem;
  font-weight: 700;
  flex-shrink: 0;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
`;
