// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { motion } from 'framer-motion';
import styled from 'styled-components';

// Tabs container.
export const TabsWrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--background-surface);
  border-bottom: 1px solid var(--border-primary-color);

  margin-top: 3rem; // header height offset
  user-select: none;
  width: 100%;
  height: 49px;

  // Scrollbar
  scrollbar-color: inherit transparent;
  overflow-y: hidden;
  overflow-x: auto;
  position: relative;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-track {
    background-color: var(--scrollbar-track-background-color);
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--scrollbar-thumb-background-color);
    &:hover {
      background-color: var(--scrollbar-thumb-background-color-hover);
    }
  }
  .inner {
    flex: 1;
    display: flex;
    align-items: center;
    column-gap: 0.75rem;
    height: 100%;
    padding: 0 1rem 0 0.75rem;
  }
`;

// Tab top div.
export const TabWrapper = styled(motion.div).attrs<{
  $active: boolean;
}>((props) => ({
  $active: props.$active,
}))`
  background-color: var(--tab-background);
  transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border-radius: 0.375rem;
  min-width: 115px;
  padding: 0.3rem 0;
  margin-top: -5px;
  cursor: pointer;

  .label {
    color: ${({ $active }) =>
      $active ? 'var(--text-bright)' : 'var(--text-color-primary)'};
    flex-grow: 1;
  }
  .inner {
    position: relative;
    display: flex;
    align-items: center;
    text-align: center;
    column-gap: 0.25rem;
    padding: 0.4rem 1.25rem;
    font-size: 1.05rem;
    z-index: 20;

    .btn-close {
      color: ${({ $active }) =>
        $active ? 'var(--text-bright)' : 'var(--text-color-primary)'};
      opacity: 0.6;
      cursor: pointer;
      &:hover {
        opacity: 1;
      }
    }
  }
  &:hover {
    background-color: var(--tab-background-hover);
    .label,
    .btn-close {
      color: var(--text-bright);
    }
  }
`;
