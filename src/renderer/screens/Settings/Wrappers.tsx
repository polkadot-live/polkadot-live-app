// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { motion } from 'framer-motion';
import styled from 'styled-components';
import { mixinHelpIcon } from '@app/library/components/Common';

export const ContentWrapper = styled.div`
  width: 100%;
  position: relative;
  padding: 1.5rem;
  background-color: var(--background-modal);

  .flex-column {
    display: flex;
    flex-direction: column;
    row-gap: 1rem;
  }
`;

export const SpinnerWrapper = styled.div`
  position: relative;

  /* 3 Dot Spinner */
  .lds-ellipsis {
    /* change color here */
    color: #afafaf;
  }
  .lds-ellipsis,
  .lds-ellipsis div {
    box-sizing: border-box;
  }
  .lds-ellipsis {
    margin-left: 8px;
    top: 12px;
    display: inline-block;
    position: relative;
  }
  .lds-ellipsis div {
    position: absolute;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
    animation-timing-function: cubic-bezier(0, 1, 1, 0);
  }
  .lds-ellipsis div:nth-child(1) {
    left: 4px;
    animation: lds-ellipsis1 0.6s infinite;
  }
  .lds-ellipsis div:nth-child(2) {
    left: 4px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  .lds-ellipsis div:nth-child(3) {
    left: 16px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  .lds-ellipsis div:nth-child(4) {
    left: 28px;
    animation: lds-ellipsis3 0.6s infinite;
  }
  @keyframes lds-ellipsis1 {
    0% {
      transform: scale(0);
    }
    100% {
      transform: scale(1);
    }
  }
  @keyframes lds-ellipsis3 {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(0);
    }
  }
  @keyframes lds-ellipsis2 {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(12px, 0);
    }
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
    font-size: 1rem;
    color: #4a4a4a;
    transition: color 0.2s ease-out;

    &:hover {
      color: inherit;
    }
  }
`;

export const HeadingWrapper = styled.div`
  margin-bottom: 1rem;
  width: 100%;
  z-index: 3;
  opacity: 0.75;
  user-select: none;
  cursor: pointer;

  .flex {
    display: flex;
    column-gap: 0.5rem;
    align-items: center;
    padding: 0.25rem 0;
    transition: background-color 0.15s ease-in-out;
    border-bottom: 1px solid var(--border-secondary-color);

    &:hover {
      background-color: #141414;
    }
    > div {
      display: flex;
      flex-direction: row;
      align-items: center;
      column-gap: 1rem;
      padding: 0.5rem;
    }

    .left {
      flex: 1;
      display: flex;
      column-gap: 0.75rem;
      justify-content: flex-start;

      .icon-wrapper {
        min-width: 0.75rem;
        opacity: 0.4;
      }
      h5 {
        font-size: 0.95rem;
        > span {
          color: var(--text-color-primary);
        }
      }
    }
    .right {
      display: flex;
      justify-content: flex-end;
    }
  }
`;

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
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 2.5rem;
  border: 1px solid var(--border-primary-color);
  background-color: var(--background-default);

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
