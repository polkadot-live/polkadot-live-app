// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

/**
 * Provides the following styled components:
 *   ReferendaGroup
 *   ReferendumRowWrapper
 */

export const ReferendaGroup = styled.div`
  --container-border-radius: 1.25rem;

  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
  border-radius: var(--container-border-radius);
  border: 1px solid var(--border-mid-color);

  > div {
    border-bottom: 2px solid var(--background-default);
  }
  > div:first-of-type {
    border-top-right-radius: var(--container-border-radius);
    border-top-left-radius: var(--container-border-radius);
  }
  > div:last-of-type {
    border-bottom-right-radius: var(--container-border-radius);
    border-bottom-left-radius: var(--container-border-radius);
    border-bottom: none;
  }
`;

export const ReferendumRowWrapper = styled.div`
  position: relative;
  padding: 1rem 1.25rem;
  background-color: var(--background-primary);
  transition: background-color 0.2s ease-out;

  &:hover {
    background-color: #121212;

    .links-wrapper {
      opacity: 1;
    }
  }

  /* Content */
  .content-wrapper {
    display: flex;
    align-items: center;
    column-gap: 1rem;

    .left {
      flex: 1;
      display: flex;
      align-items: center;
      column-gap: 1rem;
    }
    .right {
      justify-content: start;
      display: flex;
      align-items: center;
      column-gap: 1rem;
    }
  }

  /* Stats */
  .stat-wrapper {
    display: flex;
    column-gap: 1rem;
    min-width: 90px;
    display: flex;
    align-items: center;

    .icon-wrapper {
      font-size: 0.8rem;
      padding-right: 0.8rem;
      padding-left: 0.4rem;
      cursor: pointer;
      opacity: 0.4;
      &:hover {
        color: #953254;
        opacity: 1;
      }
    }
    h4 {
      display: flex;
      flex: 1;
      font-size: 1.05rem;
    }
    span {
      display: flex;
      align-items: baseline;
      padding: 0.6rem 1rem 0.5rem;
      border: 1px solid var(--border-secondary-color);
      border-radius: 0.5rem;
      font-size: 0.8rem;
      background-color: rgb(17 17 17);
    }
  }

  /* Buttons */
  .links-wrapper {
    display: flex;
    align-items: center;
    column-gap: 0.5rem;
    overflow-x: hidden;
    justify-content: end;
    opacity: 0.5;
    transition: opacity 0.2s ease-out;

    .btn-polkassembly {
      font-size: 0.95rem;
      color: rgb(169, 74, 117);
      padding: 0.4rem 1rem;
      border-radius: 1.25rem;
      background-color: #101010;
      border: 1px solid var(--background-default);
      transition: border-color 0.2s ease-out;
      cursor: pointer;

      &:hover {
        border-color: rgb(169, 74, 117);
      }
    }
    .btn-subsquare {
      font-size: 0.95rem;
      color: rgb(92 129 177);
      padding: 0.4rem 1rem;
      border-radius: 1.25rem;
      background-color: #101010;
      border: 1px solid var(--background-default);
      cursor: pointer;
      transition: border-color 0.2s ease-out;

      &:hover {
        border-color: rgb(92 129 177);
      }
    }
  }
  .menu-btn-wrapper {
    position: relative;
    padding: 0.25rem 0.5rem;
    cursor: pointer;

    svg {
      opacity: 0.6;
      transition: opacity 0.2s ease-out;
    }
    &:hover {
      svg {
        opacity: 1;
      }
    }
  }
`;
