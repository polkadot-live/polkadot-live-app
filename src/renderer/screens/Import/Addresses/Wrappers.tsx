// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const AddressWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 0rem 0rem 5rem 0rem;
  height: 100vh;
  overflow: scroll;
  padding-right: 20px;
  box-sizing: content-box;

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

  .items {
    display: flex;
    width: 100%;
    margin: 1rem 0;
    padding: 0 1rem;
    overflow-y: auto;
    overflow-x: hidden;
    flex-direction: column;

    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-track {
      background-color: #101010;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #212121;
    }
  }

  .edit {
    margin-left: 0.75rem;
  }

  .more {
    margin-top: 1rem;
    padding: 0 1.5rem;
    h4 {
      opacity: var(--opacity-disabled);
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
