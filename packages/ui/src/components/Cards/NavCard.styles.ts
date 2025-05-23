// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';
import { mixinHelpIcon } from '../Common';

export const NavCardWrapper = styled.div<{ $thin?: boolean }>`
  background-color: var(--background-primary);
  padding: ${({ $thin }) => ($thin ? '1.5rem 2rem' : '1.75rem 2rem')};
  min-height: ${({ $thin }) => ($thin ? 'fit-content' : '125px')};
  transition: background-color 150ms ease-out;
  cursor: pointer;

  &:hover {
    background-color: var(--background-primary-hover);
    .caret {
      color: var(--text-color-primary);
    }
  }

  > div {
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1rem;
    user-select: none;

    // Main content
    > div:first-child {
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: ${({ $thin }) => ($thin ? '0.75rem' : '1.5rem')};

      .thin-content {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        min-height: 32px;
      }
      .label {
        display: flex;
        gap: 0.25rem;
      }
      .help-icon {
        ${mixinHelpIcon}
        color: var(--text-dimmed);
        transition: color 150ms ease-out;
        &:hover {
          color: inherit;
        }
      }

      // Label and link
      > div {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        h1 {
          color: var(--text-highlight);
          font-size: 1.3rem;
        }
        a {
          color: var(--text-color-secondary);
          width: fit-content;
          display: block;
          cursor: pointer;
          &:hover {
            color: var(--accent-primary);
          }
        }
      }
    }

    // Arrow
    .caret {
      justify-content: end;
      align-content: center;
      font-size: 1.25rem;
      color: var(--text-dimmed);
      transition: color 150ms ease-out;
    }
  }
`;
