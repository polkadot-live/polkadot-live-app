// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const FooterWrapper = styled.div`
  background: var(--background-menu);
  border-top: 1px solid var(--border-primary-color);
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: height 0.7s cubic-bezier(0.15, 1, 0.1, 1);
  position: fixed;
  bottom: 0;
  left: 0;
  height: 3rem;
  z-index: 5;
  overflow: hidden;

  section {
    width: 100%;
  }

  .status {
    height: 3rem;
    display: flex;
    width: 100%;
    flex-flow: row nowrap;
    align-items: center;
    padding: 0 1rem;
    transition: height 0.2s;

    > div {
      flex-grow: 1;
    }

    button {
      padding: 0.25rem 0.5rem 0.25rem 1rem;
    }
    > *:first-child {
      margin-right: 0.5rem;
    }

    > *:last-child {
      margin-right: 0rem;
    }
  }

  &.expanded {
    height: 100%;
    border-top: none;

    .status {
      height: 4rem;
    }
  }

  .network-list-wrapper {
    display: flex;
    flex-direction: column;
    row-gap: 0.6rem;
    padding: 0.5rem 1rem;
  }
`;

export const NetworkItem = styled.div`
  width: 100%;
  display: flex;
  column-gap: 0.55rem;
  padding: 1rem;
  align-items: center;
  border: 1px solid var(--border-primary-color);
  border-radius: 1.25rem;
  background-color: var(--background-modal);

  .left {
    display: flex;
    align-items: center;
    column-gap: 0.55rem;
    padding: 0 0.5rem;

    > h4 {
      min-width: 75px;
      font-size: 1rem;
    }
    > .icon {
      width: 1.2rem;
      height: 1.2rem;
      margin-right: 0.5rem;
    }
  }
  .right {
    flex: 1;
    display: flex;
    align-items: center;
    column-gap: 0.55rem;

    > .success {
      width: 0.6rem;
      height: 0.6rem;
      margin-right: 0.25rem;
      border-radius: 100%;
      background-color: green;
    }
    > .danger {
      margin-right: 0.25rem;
      width: 0.6rem;
      height: 0.6rem;
      border-radius: 100%;
      background-color: red;
    }
    label {
      font-size: 0.9rem;
      color: #848484;
    }
  }
`;
