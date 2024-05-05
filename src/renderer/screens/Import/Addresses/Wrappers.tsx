// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const AddressWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: auto;

  // TODO: Remove (not being used)
  .heading {
    background: var(--background-modal);
    border-bottom: 1px solid var(--border-primary-color);
    position: sticky;
    width: 100%;
    top: 0px;
    padding: 1rem;
    z-index: 3;
    > h4 {
      display: flex;
      align-items: center;
      > span {
        color: var(--text-color-primary);
        margin-right: 0.5rem;
      }
      svg {
        width: 1.1rem;
        height: 1.1rem;
        margin-right: 0.6rem;
        path {
          fill: var(--text-color-primary);
        }
      }
    }
    h5 {
      color: var(--text-color-secondary);
      margin-top: 0.6rem;
      svg {
        margin: 0 0.4rem 0 0.25rem;
      }
    }
  }

  .items-wrapper {
    height: calc(100% - 5.5rem);
    overflow-y: auto;
    overflow-x: hidden;
    padding: 1.5rem;
    padding-top: 2.25rem;

    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-track {
      background-color: #101010;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #212121;
    }

    .items {
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin: 1rem;
      border: 1px solid var(--border-primary-color);
      border-radius: 1.25rem;
    }
    .edit {
      margin-left: 0.75rem;
    }
    .more {
      margin-bottom: 1rem;
      button {
        padding: 0.25rem;
      }
      h4 {
        opacity: var(--opacity-disabled);
      }
    }
  }
`;

export const ConfirmWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 2.5rem;
  border: 1px solid var(--border-primary-color);
  background-color: var(--background-default);

  h3,
  h5,
  p {
    text-align: center;
  }
  h3 {
    margin: 1.25rem 0 0.5rem 0;
  }
  h5 {
    margin: 0.25rem 0;
  }
  .footer {
    display: flex;
    margin-top: 1rem;

    > button {
      margin-right: 1rem;
      &:last-child {
        margin-right: 0;
      }
    }
  }
`;
