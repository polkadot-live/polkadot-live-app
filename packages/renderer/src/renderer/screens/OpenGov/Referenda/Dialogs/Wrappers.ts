// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as Dialog from '@radix-ui/react-dialog';
import styled from 'styled-components';
import type { AnyData } from '@polkadot-live/types/misc';

export const DialogTrigger = styled(Dialog.Trigger).attrs<{
  $theme: AnyData;
}>((props) => ({
  $theme: props.$theme,
}))`
  align-self: stretch; // height of parent
  min-width: fit-content;

  .Dialog__OpenIcon {
    background-color: ${(props) => props.$theme.backgroundSurface};
    height: 100%;
    min-width: 35px;
    min-height: 29.69px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease-out;

    &:hover {
      background-color: ${(props) => props.$theme.backgroundPrimaryHover};
    }
  }
`;

export const DialogContent = styled(Dialog.Content).attrs<{
  $theme: AnyData;
}>((props) => ({
  $theme: props.$theme,
}))`
  background-color: ${(props) => props.$theme.dialogContentBackground};
  position: relative;
  border-radius: 4px;
  position: fixed;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -40%);
  width: 90vw;
  max-width: 400px;
  max-height: 85vh;
  padding: 2.25rem 2rem;
  animation: dialog_contentShow 400ms cubic-bezier(0.16, 1, 0.3, 1);

  &:focus {
    outline: none;
  }

  .Dialog__Title {
    color: ${({ $theme }) => $theme.textColorPrimary};
    font-size: 1.3rem;
    margin: 0;
  }
  .Dialog__Description {
    color: ${({ $theme }) => $theme.textColorSecondary};
    font-size: 1.1rem;
  }
  .Dialog__Button {
    color: ${({ $theme }) => $theme.textColorPrimary};
    background-color: ${({ $theme }) => $theme.buttonBackgroundPrimary};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem;
    padding: 1rem 1.25rem;
    font-size: 1.1rem;
    font-weight: bolder;
    user-select: none;

    &:disabled {
      color: ${({ $theme }) => $theme.textDimmed};
      cursor: not-allowed;
    }
    &:focus:not(:focus-visible) {
      outline: 0;
    }
    &:focus-visible {
    }
    &:hover:not([disabled]) {
      filter: brightness(110%);
    }
  }
  .Dialog__IconButton {
    color: ${({ $theme }) => $theme.textColorPrimary} !important;
    all: unset;
    font-family: inherit;
    border-radius: 100%;
    height: 25px;
    width: 25px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 10px;
    right: 10px;
    transition: filter 200ms ease-out;
    cursor: pointer !important;
  }
  .Dialog__IconButton:hover {
    filter: brightness(80%);
  }
  .Dialog__IconButton:focus {
    // focus
  }
  .Dialog__FieldSet {
    flex: 1;
    background-color: ${({ $theme }) => $theme.backgroundPrimary};
    border-radius: 0.375rem;
    padding: 0.5rem 1.25rem;
  }
  .Dialog__Label {
    color: ${({ $theme }) => $theme.textDimmed};
    font-size: 1.1rem;
    text-align: right;
    cursor: pointer;
  }
  .Dialog__Input {
    color: ${({ $theme }) => $theme.textColorPrimary};
    width: 100%;
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem;
    font-size: 1.1rem;

    &[type='number']::-webkit-inner-spin-button,
    &[type='number']::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
  .Dialog__Input::placeholder {
    color: ${({ $theme }) => $theme.textDimmed};
  }
  .Dialog__Input:focus {
    // focus
  }

  @keyframes dialog_contentShow {
    from {
      opacity: 0;
      transform: translate(-50%, -40%) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -40%) scale(1);
    }
  }
`;
