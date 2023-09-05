// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';

export const FooterWrapper = styled.div`
  background: var(--background-menu);
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

  > .icon {
    width: 1.75rem;
    height: 1.75rem;
    fill: var(--text-color-primary);
    margin-right: 0.75rem;
  }
`;
