// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';
import { mixinHelpIcon } from '@/renderer/library/components/Common';

export const ImportMethodCard = styled.div`
  background-color: #1c1c1c;
  padding: 1.75rem 2rem;
  transition: background-color 150ms ease-out;
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

export const SplashWrapper = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;

  .icon {
    width: 100%;
    max-height: 12rem;
    display: flex;
    justify-content: center;
    z-index: 0;
  }

  .content {
    z-index: 1;
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    width: 100%;

    h1,
    h4,
    h5 {
      text-align: center;
      margin-top: 0.35rem;
      svg {
        margin-right: 0.3rem;
      }
    }
    h4 {
      font-family: InterBold, sans-serif;
      margin: 0.5rem 0;
    }
    h5 {
      min-height: 2rem;
    }
    .btns {
      margin-top: 1.5rem;
      display: flex;
      justify-content: center;
    }
    button {
      font-family: InterSemiBold, sans-serif;
      cursor: pointer;
      z-index: 1;
      padding: 0.5rem 1.75rem !important;
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

export const QRVieweraWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 1rem 1rem;

  .title {
    color: var(--network-color-primary);
    font-family: 'Unbounded';
    margin-bottom: 1rem;
  }

  .progress {
    margin-bottom: 1rem;
    border-radius: 1rem;
    background: var(--background-menu);
    padding: 0.45rem 1.5rem 0.75rem 1.5rem;

    span {
      opacity: 0.4;
      &.active {
        opacity: 1;
      }
    }
    .arrow {
      margin: 0 0.85rem;
    }
  }

  .viewer {
    border-radius: 1.25rem;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;

    &.withBorder {
      padding: 0.95rem;
      border: 3.75px solid var(--network-color-pending);
    }
  }
  .foot {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 1.75rem;
    padding: 0 1rem;
    width: 100%;

    > div {
      display: flex;
      width: 100%;
      justify-content: center;
      margin-top: 0.75rem;
    }
  }
`;
