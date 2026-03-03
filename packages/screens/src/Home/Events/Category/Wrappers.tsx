// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { motion } from 'framer-motion';
import styled from 'styled-components';

/** Chevron-right indicator — nudges right on card hover. */
export const ChevronIndicator = styled.span`
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

/** Outer card wrapper. */
export const CategoryCard = styled(motion.div)<{ $accentColor: string }>`
  background-color: var(--background-primary);
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--background-primary-hover);
  }

  &:hover ${ChevronIndicator} {
    opacity: 0.8;
    transform: translateX(2px);
  }
`;

/** Top row: icon, name, badge */
export const CategoryCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.8rem 0.85rem 0.4rem;

  .category-name {
    flex: 1;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-color-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

/** Accent-coloured circle behind the FontAwesome icon. */
export const IconCircle = styled.span<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: ${({ $color }) => `${$color}22`};
  color: ${({ $color }) => $color};
  font-size: 0.82rem;
  flex-shrink: 0;
`;

/** Pill-shaped count badge. */
export const CountBadge = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 22px;
  padding: 0 0.5rem;
  border-radius: 999px;
  background-color: ${({ $color }) => `${$color}22`};
  color: ${({ $color }) => $color};
  font-size: 0.88rem;
  font-weight: 700;
  flex-shrink: 0;
`;

/** Body area that wraps the sparkline chart. */
export const CategoryCardBody = styled.div`
  padding: 0.15rem 0 0.5rem;
`;

/** Fixed-height container for the Line chart. */
export const GraphContainer = styled.div`
  position: relative;
  width: 100%;
  height: 52px;
`;
