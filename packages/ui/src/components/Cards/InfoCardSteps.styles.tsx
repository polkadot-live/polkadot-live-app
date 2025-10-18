// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const InfoCardStepsWrapper = styled.div`
  background-color: var(--background-surface);
  color: var(--text-color-secondary);

  display: flex;
  gap: 0.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 0.375rem;

  > span:first-of-type {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    flex: 1;
  }
  > div:first-of-type {
    display: flex;
    gap: 0.75rem;
    align-items: center;

    > button {
      color: var(--text-color-secondary);
      font-size: 1.15rem;
      transition: all 0.15s ease-out;

      &:hover:not(:disabled) {
        color: var(--text-color-primary);
      }
      &:disabled {
        color: var(--text-dimmed);
        cursor: not-allowed;
      }
    }

    > span {
      text-align: center;
      min-width: 35px;
    }
  }
`;
