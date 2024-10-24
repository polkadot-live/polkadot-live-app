// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled, { css } from 'styled-components';

// Base styles to mixin styled header components.
const headerBase = css`
  width: 100%;
  user-select: none;
  z-index: 3;
  cursor: pointer;

  .flex {
    padding: 0.5rem 0.35rem;
    border-radius: 0.375rem;
    transition: background-color 0.15s ease-in-out;

    &:hover {
      background-color: #1a1919;
    }
    .left {
      flex: 1;
      display: flex;
      justify-content: flex-start;

      h5 {
        font-family: InterSemiBold, sans-serif;
        font-size: 1.25rem;
        padding: 0 0.2rem;
        line-height: 1.6rem;
        margin-top: 0;

        > span {
          color: var(--text-color-primary);
        }
      }
    }
    .right {
      display: flex;
      justify-content: flex-end;
      padding-right: 1.6rem; // line up with toggles below
    }

    .icon-wrapper {
      svg {
        color: #b8b3b9;
      }
    }
  }
`;

export const AccordionColumns = styled.div<{ $gap?: string }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => ($gap ? $gap : '1rem')};
`;

export const HeadingWrapper = styled.div`
  ${headerBase}

  .flex {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 0.5rem 0.35rem;

    > div {
      display: flex;
      flex-direction: row;
      align-items: center;
      column-gap: 1rem;
      padding: 0.5rem;
    }

    .left {
      column-gap: 0.75rem;

      .icon-wrapper {
        min-width: 0.75rem;
      }
    }
  }
`;

export const WideHeadingWrapper = styled.div`
  ${headerBase}

  .flex {
    padding: 0.25rem 0;

    > div {
      display: flex;
      flex-direction: row;
      align-items: baseline;
      column-gap: 1rem;
      padding: 0.5rem;
    }
    .left {
      .icon-wrapper {
        min-width: 0.65rem;
      }
    }
  }

  .icon {
    fill: var(--text-color-primary);
    width: 0.95rem;
    height: 0.95rem;
    margin-right: 0.6rem;
  }
`;
