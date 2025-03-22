// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';
import type { AnyData } from '@polkadot-live/types/misc';

export const AddressesWrapper = styled.div<{ $theme: AnyData }>`
  border-radius: 0.375rem;
  padding: 0.5rem;
  background-color: ${(props) => props.$theme.backgroundPrimary};

  .Container {
    height: 225px;
    overflow-y: auto;

    // Scrollbar
    scrollbar-color: inherit transparent;
    overflow-y: auto;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-track {
      background-color: ${(props) =>
        props.$theme.dialogScrollbarThumbBackgroundColor};
    }
    &::-webkit-scrollbar-thumb {
      background-color: ${(props) =>
        props.$theme.dialogScrollbarTrackBackgroundColor};
      &:hover {
        background-color: ${(props) =>
          props.$theme.dialogScrollbarThumbBackgroundColorHover};
      }
    }
  }
`;

export const SelectedAddressItem = styled.div<{
  $theme: AnyData;
}>`
  cursor: pointer;
  width: 100%;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  font-size: 1.1rem;
  user-select: none;

  h3,
  h4 {
    text-align: left;
    font-weight: normal;
  }
  h3 {
    color: ${(props) => props.$theme.textColorPrimary};
    font-size: 1.03rem;
  }
  h4 {
    color: ${(props) => props.$theme.textColorSecondary};
    font-size: 1rem;
  }
`;

export const AddressItem = styled.div<{ $theme: AnyData; selected: boolean }>`
  --background: ${(props) => props.$theme.backgroundPrimary};
  --background-hover: ${(props) => props.$theme.backgroundPrimaryHover};
  --text-primary: ${(props) => props.$theme.textColorPrimary};
  --text-secondary: ${(props) => props.$theme.textColorSecondary};
  --text-bright: ${(props) => props.$theme.textBright};
  --background-success: ${(props) => props.$theme.accentSuccess};

  background-color: ${(props) =>
    props.selected ? 'var(--background-success)' : 'var(--background)'};

  cursor: pointer;
  width: 100%;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  padding: 1rem 1.25rem;
  font-size: 1.03rem;
  user-select: none;

  h3,
  h4 {
    font-weight: normal;
  }
  h3 {
    color: ${(props) =>
      props.selected ? 'var(--text-bright)' : 'var(--text-primary)'};
    font-size: 1.03rem;
  }
  h4 {
    color: ${(props) =>
      props.selected ? 'var(--text-bright)' : 'var(--text-secondary)'};
    font-size: 1rem;
  }
  .ClearBtn {
    transition: opacity 0.1s ease-out;
    color: var(--text-bright);
    opacity: 0.6;
  }

  &:hover {
    background-color: ${(props) =>
      props.selected ? 'var(--background-success)' : 'var(--background-hover)'};
    .ClearBtn {
      opacity: 1;
    }
  }
`;

export const InputIdenticonWrapper = styled.div`
  min-width: fit-content;
  align-self: stretch;
  align-items: center;
  justify-content: center;
  border-top-left-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;
  padding: 1rem 0.25rem 1rem 1rem;
`;

export const InputWrapper = styled.div<{ $theme: AnyData }>`
  background-color: ${(props) => props.$theme.backgroundPrimary};
  display: flex;
  align-items: center;
  padding: 1.25rem;
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;

  input {
    color: ${(props) => props.$theme.textColorPrimary};
    padding: 0;
    font-size: 1.05rem;
    font-weight: 500;
    width: 100%;
    text-align: left;
    cursor: default;

    &::placeholder {
      color: ${(props) => props.$theme.textColorSecondary};
      opacity: 0.5;
    }
    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
`;

export const ConfirmBtn = styled.button<{ $theme: AnyData }>`
  background-color: ${(props) => props.$theme.backgroundPrimary};
  align-self: stretch;
  padding: 0 1.25rem;
  border-radius: 0.375rem;

  &:hover:not([disabled]) {
    background-color: ${(props) => props.$theme.accentSuccess};
    color: ${(props) => props.$theme.textBright};
  }
  &:disabled {
    cursor: not-allowed;
    > span {
      opacity: 0.3;
    }
  }
`;

export const TriggerButton = styled.button<{ $theme: AnyData }>`
  background-color: ${(props) => props.$theme.backgroundPrimary};
  color: ${(props) => props.$theme.textColorPrimary};

  display: inline-flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1.25rem 1.25rem;
  border-radius: 0.375rem;
  font-size: 1.1rem;

  &:hover {
    background-color: ${(props) => props.$theme.backgroundPrimaryHover};
  }
`;
