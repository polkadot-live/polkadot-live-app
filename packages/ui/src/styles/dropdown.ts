// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import styled, { css } from 'styled-components';
import type { AnyData } from '@polkadot-live/types/misc';

const dropdownMixin = css`
  background-color: var(--dropdown-background);
  min-width: 130px;
  border-radius: 6px;
  padding: 1rem 5px 1rem 5px;
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
    padding: 1.2rem 1rem 1.2rem 0.1rem;
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
    background-color: var(--dropdown-item-highlight);
    color: var(--text-bright);
  }

  .DropdownMenuLabel {
    color: var(--text-secondary);
    padding: 0 2px 2px 10px;
    font-size: 1rem;
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
    fill: var(--dropdown-background);
  }
  .LeftSlot {
    padding: 0 1.25rem 0 0.75rem;
    color: var(--text-secondary);
  }
  .RightSlot {
    margin-left: auto;
    padding-left: 20px;
    color: var(--text-secondary);
  }
  [data-highlighted] > .RightSlot,
  [data-highlighted] > .LeftSlot {
    color: var(--text-bright);
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
  --dropdown-item-highlight: ${(props) => props.$theme.dropdownItemHighlight};
  --button-primary: ${(props) => props.$theme.buttonBackgroundPrimary};
  --button-primary-hover: ${(props) =>
    props.$theme.buttonBackgroundPrimaryHover};
  --border-primary: ${(props) => props.$theme.borderPrimaryColor};
  --dropdown-background: ${(props) => props.$theme.dropdownBackground};
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
