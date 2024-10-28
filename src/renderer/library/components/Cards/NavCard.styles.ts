// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';
import { mixinHelpIcon } from '../Common';

export const NavCardWrapper = styled.div`
  background-color: #1c1c1c;
  padding: 1.75rem 2rem;
  transition: background-color 150ms ease-out;
  min-height: 125px;
  cursor: pointer;

  &:hover {
    background-color: #212121;
    .caret {
      color: inherit;
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
      gap: 1.5rem;

      .label {
        display: flex;
        gap: 0.25rem;
      }
      .help-icon {
        ${mixinHelpIcon}
        color: #5a5a5a;
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
          font-size: 1.3rem;
          color: #f1f1f1;
        }
        a {
          width: fit-content;
          color: var(--text-color-secondary);
          display: block;
          cursor: pointer;
          &:hover {
            color: #d33079;
          }
        }
      }
    }

    // Arrow
    .caret {
      justify-content: end;
      align-content: center;
      font-size: 1.25rem;
      color: #5a5a5a;
      transition: color 150ms ease-out;
    }
  }
`;
