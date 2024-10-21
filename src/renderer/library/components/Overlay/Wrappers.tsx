// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const OverlayWrapper = styled.div`
  background: var(--modal-background-color);

  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 11;

  /* content wrapper */
  > div {
    height: 100%;
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    align-items: center;
    padding: 1rem 2rem;

    /* click anywhere behind overlay to close */
    .close {
      position: fixed;
      width: 100%;
      height: 100%;
      z-index: 8;
      cursor: default;
    }
  }
`;

export const HeightWrapper = styled.div<{ size: string }>`
  transition: height 0.5s cubic-bezier(0.1, 1, 0.2, 1);
  width: 100%;
  max-width: ${(props) => (props.size === 'small' ? '400px' : '600px')};
  max-height: 100%;
  border-radius: 1.5rem;
  z-index: 9;
  position: relative;
  overflow: hidden;
`;

export const ContentWrapper = styled.div`
  &.bg {
    background: var(--background-primary);
  }

  &.transparent {
    background: none;
  }

  width: 100%;
  height: auto;
  overflow: hidden;
  position: relative;

  a {
    color: var(--network-color-primary);
  }
  .header {
    width: 100%;
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    padding: 1.25rem 3rem 0.25 3rem;
  }
  .body {
    padding: 0.5rem 1.5rem 1.25rem 1.5rem;
    h4 {
      margin: 1.25rem 0;
    }
  }
`;
