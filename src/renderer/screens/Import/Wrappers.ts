// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

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
