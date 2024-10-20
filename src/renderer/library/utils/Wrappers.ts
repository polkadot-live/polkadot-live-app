// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

/**
 * @name ScrollWrapper
 * @summary A simple scroll wrapper that should be used instead of Scrollable.
 */
export const ScrollWrapper = styled.div`
  scrollbar-color: inherit transparent;

  overflow-y: auto;
  overflow-x: hidden;
  position: relative;

  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-track {
    background-color: #101010;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #212121;
  }
`;

/**
 * @name Scrollable
 * @summary A scrollable container with which takes into account header and footer heights.
 */
export const Scrollable = styled.div<{
  $footerHeight?: number;
  $headerHeight?: number;
}>`
  --footer-height: ${(props) => {
    const height = props.$footerHeight;
    return height !== undefined ? `${height}px` : '40px';
  }};

  --header-height: ${(props) => {
    const height = props.$headerHeight;
    return height !== undefined ? `${height}px` : '38.6px';
  }};

  // height = window height - (header height + footer height)
  height: calc(100vh - var(--footer-height));
  width: 100%;
  padding: 1.5rem 0 1rem;
  overflow-y: auto;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-track {
    background-color: #101010;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #212121;
  }
`;
