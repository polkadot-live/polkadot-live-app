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
`;

export const NetworkItem = styled.div`
  width: 100%;
  display: flex;
  border-bottom: 1px solid var(--border-primary-color);
  padding: 1rem;
  align-items: center;

  > h4 {
    min-width: 75px;
  }
  > .icon {
    width: 1.75rem;
    height: 1.75rem;
    fill: var(--text-color-primary);
    margin-right: 0.75rem;
  }
  > .success {
    margin: 0 10px;
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 100%;
    background-color: green;
  }
  > .danger {
    margin: 0 10px;
    width: 0.7rem;
    height: 0.7rem;
    border-radius: 100%;
    background-color: red;
  }
  label {
    font-size: 0.9rem;
    color: #848484;
  }
`;
