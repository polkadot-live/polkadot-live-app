// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const FlexRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 1.25rem;
  background-color: var(--background-primary);
  border-radius: 0.375rem;

  input {
    padding: 0;
    color: var(--text-color-primary);
    font-size: 1.2rem;
    font-weight: 500;
    width: 100%;
    text-align: left;
    cursor: default;

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
  span {
    color: var(--text-color-primary);
    font-size: 1.25rem;
    margin-left: 5px;
  }

  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    appearance: none;
    margin: 0;
  }
`;

export const AddButton = styled.button`
  background-color: var(--button-pink-background);
  margin-top: 0.4rem;

  display: flex;
  gap: 0.75rem;
  justify-content: center;
  align-items: center;
  color: var(--text-bright);
  padding: 1rem 1.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease-out;
  user-select: none;

  &:hover:not(:disabled) {
    filter: brightness(1.2);
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const CopyButton = styled.button`
  font-size: 1.15rem;
  &:hover {
    filter: brightness(130%);
  }
`;

export const ProgressBarWrapper = styled.div`
  background-color: var(--background-surface);
  width: 100%;
  height: 10px;
  border-radius: 5px;
  overflow: hidden;

  .progress-fill {
    background-color: var(--accent-primary);
    height: 100%;
    transition: width 0.2s ease-in-out;
  }
`;

export const NextStepArrowWrapper = styled.div<{ $complete: boolean }>`
  margin-top: 0.75rem;
  > button {
    svg {
      background-color: ${(props) =>
        props.$complete ? '#417041' : 'var(--text-color-secondary)'};
      width: 22px;
      height: 22px;
      border-radius: 100%;
    }
    text-align: center;
    width: 100%;
    color: var(--background-surface);
    opacity: ${(props) => (props.$complete ? '1' : '0.15')};
    transition: all 0.2s ease-out;
    cursor: ${(props) => (props.$complete ? 'pointer' : 'not-allowed')};

    &:hover {
      filter: ${(props) =>
        props.$complete ? 'brightness(140%)' : 'brightness(100%)'};
    }
  }
`;
