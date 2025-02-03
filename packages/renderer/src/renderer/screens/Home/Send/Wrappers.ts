// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Tooltip from '@radix-ui/react-tooltip';
import styled from 'styled-components';
import type { AnyData } from '@polkadot-live/types/misc';

export const TooltipContent = styled(Tooltip.Content).attrs<{
  $theme: AnyData;
}>((props) => ({
  $theme: props.$theme,
}))`
  --background-primary: ${(props) => props.$theme.buttonBackgroundSecondary};
  --text-primary: ${(props) => props.$theme.textColorPrimary};

  background-color: var(--background-primary);
  color: var(--text-primary);
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  user-select: none;
  animation-duration: 500ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;

  &[data-state='delayed-open'][data-side='top'] {
    animation-name: slideDownAndFade;
  }
  &[data-state='delayed-open'][data-side='right'] {
    animation-name: slideLeftAndFade;
  }
  &[data-state='delayed-open'][data-side='bottom'] {
    animation-name: slideUpAndFade;
  }
  &[data-state='delayed-open'][data-side='left'] {
    animation-name: slideRightAndFade;
  }

  .TooltipArrow {
    fill: var(--background-primary);
  }

  @keyframes slideUpAndFade {
    from {
      opacity: 0;
      transform: translateY(2px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideRightAndFade {
    from {
      opacity: 0;
      transform: translateX(-2px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideDownAndFade {
    from {
      opacity: 0;
      transform: translateY(-2px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideLeftAndFade {
    from {
      opacity: 0;
      transform: translateX(2px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
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
