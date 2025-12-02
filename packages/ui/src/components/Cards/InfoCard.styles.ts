// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const ScreenInfoCardWrapper = styled.div`
  background-color: var(--background-default);
  color: var(--text-color-secondary);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  padding: 2rem 1rem;
  border-radius: 0.375rem;
  font-size: 1rem;

  > div {
    color: var(--text-color-secondary);
    width: 100%;
    align-items: center;
    font-size: 1.05rem;
  }
`;

export const InfoCardWrapper = styled.div`
  background-color: var(--background-surface);
  color: var(--text-color-secondary);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  margin-top: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 1rem;

  .dismiss {
    color: var(--accent-warning) !important;
    font-size: 0.8rem;
    filter: brightness(0.65);

    &:hover {
      filter: brightness(1);
    }
  }
  .warning {
    color: var(--accent-warning) !important;
    > span:first-of-type {
      flex: 1;
    }
  }
  .Label {
    line-height: 1.4rem;
  }

  > span {
    display: flex;
    gap: 0.9rem;
    align-items: center;
  }
`;
