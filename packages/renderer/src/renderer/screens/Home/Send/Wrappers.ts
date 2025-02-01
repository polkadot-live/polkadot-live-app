// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

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
  background-color: var(--button-background-primary);
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
