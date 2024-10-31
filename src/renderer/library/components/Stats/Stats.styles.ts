// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';
import { mixinHelpIcon } from '../Common';

export const MainHeading = styled.h1`
  color: var(--text-main-heading);
  font-size: 1.65rem;
  margin-bottom: 1rem;
`;

export const SubHeading = styled.div`
  color: var(--text-color-primary);
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  h2 {
    font-size: 1.25rem;
    padding: 0 0.2rem;
    user-select: none;
  }
  svg {
    min-width: 90px;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.25rem;

  div:nth-of-type(3n) {
    border-top-right-radius: 0.375rem;
    border-bottom-right-radius: 0.375rem;
  }
  div:nth-of-type(3n + 1) {
    border-top-left-radius: 0.375rem;
    border-bottom-left-radius: 0.375rem;
  }
`;

export const StatsSectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 1rem;

  .total-item {
    background-color: var(--stats-background-highlight) !important;
    h3,
    span {
      color: var(--text-highlight) !important;
      font-size: 1.26rem !important;
    }
  }

  .btn {
    color: var(--text-bright);
    background-color: var(--accent-primary);
    border: none;
    min-width: 8.5rem;
  }

  .header-wrapper {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 0.5rem 0.35rem;
    border-radius: 0.375rem;
    transition: background-color 150ms ease-out;
    cursor: pointer;

    &:hover {
      background-color: var(--accordion-background-hover);
    }
  }
`;

export const StatItem = styled.div`
  background-color: var(--background-primary);
  display: flex;
  align-items: start;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;

  > div:first-of-type {
    width: 100%;
    flex: 1;
    display: flex;
    align-items: center;
    > h3 {
      flex: 1;
    }
    .help {
      ${mixinHelpIcon}
      color: var(--text-dimmed);
      font-size: 0.85rem;
      transition: all 150ms ease-out;
      border-radius: 0.275rem;
      &:hover {
        color: var(--text-highlight);
      }
    }
  }

  h3 {
    color: var(--stats-text-title);
    width: 100%;
    font-size: 1.1rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  span {
    font-size: 1.2rem;
    font-weight: 600;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
