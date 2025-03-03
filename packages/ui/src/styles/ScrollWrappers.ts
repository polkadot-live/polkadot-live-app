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
    background-color: var(--scrollbar-track-background-color);
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--scrollbar-thumb-background-color);
  }
`;

/**
 * @name Scrollable
 * @summary A scrollable container with which takes into account header and footer heights.
 */
export const Scrollable = styled.div`
  height: 100%;
  width: 100%;
  overflow-y: auto;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-track {
    background-color: var(--scrollbar-track-background-color);
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--scrollbar-thumb-background-color);
  }
`;
