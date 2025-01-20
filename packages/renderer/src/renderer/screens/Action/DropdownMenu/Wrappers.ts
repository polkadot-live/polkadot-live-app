// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import styled, { css } from 'styled-components';
import type { AnyData } from '@polkadot-live/types/misc';

export const IconButton = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.25rem 1.25rem;
  border-radius: 0.375rem;
  opacity: 0.75;
  height: 100%;

  &:hover {
    opacity: 1;
  }
  //&:focus {
  //}
`;

const dropdownMixin = css`
  background-color: var(--background-primary);
  min-width: 130px;
  border-radius: 6px;
  padding: 5px;
  animation-duration: 400ms;
  animation-timing-function: cubic-bezier(0.16 1, 0.3, 1);
  will-change: transform opacity;

  &[data-side='top'] {
    animation-name: slideDownAndFade;
  }
  &[data-side='right'] {
    animation-name: slideLeftAndFade;
  }
  &[data-side='bottom'] {
    animation-name: slideUpAndFade;
  }
  &[data-side='left'] {
    animation-name: slideRightAndFade;
  }

  .DropdownMenuItem,
  .DropdownMenuCheckboxItem,
  .DropdownMenuRadioItem,
  .DropdownMenuSubTrigger {
    color: var(--text-primary);
    display: flex;
    align-items: center;
    position: relative;
    max-height: 25px;
    font-size: 13px;
    padding: 1.2rem 0.75rem;
    border-radius: 0.375rem;
    user-select: none;
    outline: none;
    cursor: pointer;
  }
  .DropdownMenuSubTrigger[data-state='open'] {
    background-color: var(--button-primary);
    color: var(--text-bright);
  }
  .DropdownMenuItem[data-disabled],
  .DropdownMenuCheckboxItem[data-disabled],
  .DropdownMenuRadioItem[data-disabled],
  .DropdownMenuSubTrigger[data-disabled] {
    color: var(--text-dimmed);
    pointer-events: none;
  }
  .DropdownMenuItem[data-highlighted],
  .DropdownMenuCheckboxItem[data-highlighted],
  .DropdownMenuRadioItem[data-highlighted],
  .DropdownMenuSubTrigger[data-highlighted] {
    background-color: var(--button-primary-hover);
    color: var(--text-bright);
  }

  .DropdownMenuLabel {
    color: var(--text-secondary);
    padding-left: 25px;
    font-size: 12px;
    line-height: 25px;
  }

  .DropdownMenuSeparator {
    background-color: var(--border-primary);
    height: 1px;
    margin: 5px;
  }

  .DropdownMenuItemIndicator {
    position: absolute;
    left: 0;
    width: 25px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .DropdownMenuArrow {
    fill: var(--background-primary);
  }
  .LeftSlot {
    padding-right: 1.25rem;
    color: var(--text-secondary);
  }
  .RightSlot {
    margin-left: auto;
    padding-left: 20px;
    color: var(--text-secondary);
  }
  [data-highlighted] > .RightSlot,
  [data-highlighted] > .LeftSlot {
    color: var(--text-secondary);
  }
  [data-disabled] .RightSlot,
  [data-disabled] .LeftSlot {
    opacity: 0.45;
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

export const DropdownMenuContent = styled(DropdownMenu.Content).attrs<{
  $theme: AnyData;
}>((props) => ({
  $theme: props.$theme,
}))`
  --accent-primary: ${(props) => props.$theme.accentPrimary};
  --background-primary: ${(props) => props.$theme.backgroundPrimary};
  --button-primary: ${(props) => props.$theme.buttonBackgroundPrimary};
  --button-primary-hover: ${(props) =>
    props.$theme.buttonBackgroundPrimaryHover};
  --border-primary: ${(props) => props.$theme.borderPrimaryColor};
  --text-primary: ${(props) => props.$theme.textColorPrimary};
  --text-secondary: ${(props) => props.$theme.textColorSecondary};
  --text-bright: ${(props) => props.$theme.textBright};
  --text-dimmed: ${(props) => props.$theme.textDimmed};

  ${dropdownMixin}
`;

export const DropdownMenuSubContent = styled(DropdownMenu.SubContent).attrs<{
  $theme: AnyData;
}>((props) => ({
  $theme: props.$theme,
}))`
  --accent-primary: ${(props) => props.$theme.accentPrimary};
  --background-primary: ${(props) => props.$theme.backgroundPrimary};
  --button-primary: ${(props) => props.$theme.buttonBackgroundPrimary};
  --button-primary-hover: ${(props) =>
    props.$theme.buttonBackgroundPrimaryHover};
  --border-primary: ${(props) => props.$theme.borderPrimaryColor};
  --text-primary: ${(props) => props.$theme.textColorPrimary};
  --text-secondary: ${(props) => props.$theme.textColorSecondary};
  --text-bright: ${(props) => props.$theme.textBright};
  --text-dimmed: ${(props) => props.$theme.textDimmed};

  ${dropdownMixin}
  margin-right: 1rem;
`;
