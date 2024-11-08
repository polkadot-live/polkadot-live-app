// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { motion } from 'framer-motion';
import styled from 'styled-components';
import { mixinHelpIcon } from '@app/library/components/Common';

export const ContentWrapper = styled.div`
  background-color: var(--background-window);
  width: 100%;
  position: relative;
  padding: 1.5rem;

  .flex-column {
    display: flex;
    flex-direction: column;
    row-gap: 1rem;
  }
`;

export const SettingWrapper = styled(motion.div)`
  position: relative;
  display: flex;
  width: 100%;
  column-gap: 1rem;
  padding: 1.15rem 1rem;
  font-size: 1.15rem;

  .left {
    flex: 1;
    display: flex;
    align-items: center;
    column-gap: 0.5rem;
  }
  .right {
    display: flex;
    align-items: center;
    justify-content: end;
  }
  .icon-wrapper {
    ${mixinHelpIcon}
    color: var(--text-dimmed);
    font-size: 1rem;
    transition: color 0.2s ease-out;

    &:hover {
      color: var(--text-highlight);
    }
  }
`;

/* ------------------------------------------------------------ */
/* Workspaces                                                   */
/* ------------------------------------------------------------ */

export const WorkspacesContainer = styled.div`
  margin-bottom: 1.5rem;
  background-color: var(--background-primary);
  border: 1px solid var(--border-primary-color);
  border-radius: 1.25rem;

  > div:first-of-type {
    border-top-left-radius: 1.25rem;
    border-top-right-radius: 1.25rem;
  }
  > div:last-of-type {
    border-bottom-left-radius: 1.25rem;
    border-bottom-right-radius: 1.25rem;
    border-bottom: none;
  }
`;

export const WorkspaceRowWrapper = styled.div`
  display: flex;
  align-items: center;
  column-gap: 1.5rem;
  padding: 1.5rem;
  background-color: var(--background-primary);
  border-bottom: 2px solid var(--background-default);
  transition: background-color 0.1s ease-out;

  // Index badge.
  .stat-wrapper {
    display: flex;
    column-gap: 1rem;
    align-items: center;

    span {
      display: flex;
      align-items: center;
      column-gap: 0.4rem;
      padding: 0.5rem 1rem;
      border: 1px solid var(--border-secondary-color);
      border-radius: 0.5rem;
      font-size: 0.8rem;
      background-color: rgb(17 17 17);
    }
  }

  // Label text.
  .workspace-label {
    > span:first-of-type {
      font-size: 1rem;
    }
    > span:last-of-type {
      font-size: 0.9rem;
      color: #646464;
      margin-left: 1rem;
    }
  }

  // Button tweaks.
  .button-tweaks {
    .icon-wrapper {
      width: 48px;
    }
    .icon-wrapper:first-of-type {
      font-size: 0.9rem;
      cursor: pointer;
      svg {
        margin-left: 1px !important;
      }
    }
    .icon-wrapper:last-of-type {
      font-size: 0.8rem;
      cursor: pointer;
      svg {
        margin-left: 2px;
      }
    }
  }

  div:nth-child(2) {
    flex: 1;
  }
  &:hover {
    background-color: #121212;
  }
`;

export const ConfirmWrapper = styled.div`
  background-color: var(--background-default);
  border: 1px solid var(--border-primary-color);
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 2.5rem;

  h3,
  h5,
  p {
    text-align: center;
  }
  h3 {
    margin: 1.25rem 0 0.5rem 0;
  }
  h5 {
    margin: 0.25rem 0;
  }
  .footer {
    display: flex;
    margin-top: 1rem;

    > button {
      margin-right: 1rem;
      &:last-child {
        margin-right: 0;
      }
    }
  }
`;
