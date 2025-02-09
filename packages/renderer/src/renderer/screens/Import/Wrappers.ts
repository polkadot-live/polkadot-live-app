// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Checkbox from '@radix-ui/react-checkbox';
import styled from 'styled-components';
import type { AnyData } from '@polkadot-live/types/misc';

/** Import Screens */
export const ImportAddressRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.75rem;
  padding: 1.15rem 1.5rem;

  > .addressInfo {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;

    > h2 {
      margin: 0;
      padding: 0;
      font-size: 1.1rem;
    }
    > span {
      color: var(--text-color-secondary);
    }
  }

  .imported {
    color: var(--text-color-secondary);
    font-size: 1rem;
  }
`;

export const AddressListFooter = styled.div`
  background-color: var(--background-window) !important;
  display: flex;
  align-content: center;
  gap: 0.75rem;
  margin-top: 0.75rem;

  .pageBtn {
    background-color: var(--background-primary);
    padding: 0 1.75rem;
    border-radius: 0.375rem;
    transition: all 0.2s ease-out;

    svg {
      width: 22px;
      height: 22px;
    }
    &:hover:not(:disabled) {
      background-color: var(--background-primary-hover);
    }
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  .importBtn {
    flex: 1;
    text-align: right;
    > button {
      background-color: var(--accent-success);
      color: var(--text-bright);
      padding: 0.95rem 1.5rem;
      border-radius: 0.375rem;
      min-width: 225px;
      transition: all 0.2s ease-out;

      &:hover:not(:disabled) {
        filter: brightness(1.2);
      }
      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }
  }
`;

export const CheckboxRoot = styled(Checkbox.Root).attrs<{
  $theme: AnyData;
}>((props) => ({
  $theme: props.$theme,
}))`
  background-color: var(--background-surface);
  border: 1px solid var(--border-subtle);
  width: 30px;
  height: 30px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px var(--black-a7);
  transition: background-color 0.2s ease-out;

  &:disabled {
    filter: brightness(0.9);
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    background-color: var(--background-secondary-color);
  }
  .CheckboxIndicator {
    color: var(--violet-11);
  }
`;

// TODO: Move to UI library.
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

/** Other */
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
