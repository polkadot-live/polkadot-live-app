// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { motion } from 'framer-motion';
import styled from 'styled-components';

// Tabs container.
export const TabsWrapper = styled.div`
  background-color: var(--background-surface);
  border-bottom: 1px solid var(--border-primary-color);

  margin-top: 3rem; // header height offset
  user-select: none;
  width: 100%;
  height: 49px;

  .inner {
    display: flex;
    align-items: center;
    column-gap: 0.75rem;
    height: 100%;
    padding: 0 1.15rem;
    .label {
      color: var(--text-highlight);
      flex-grow: 1;
    }
  }
`;

// Tab top div.
export const TabWrapper = styled(motion.div)`
  background-color: var(--nav-button-background);
  transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border-radius: 0.375rem;
  min-width: 115px;
  padding: 0.3rem 0;
  margin-top: -5px;
  cursor: pointer;

  &:hover {
    background-color: var(--nav-button-background-hover);
  }

  .inner {
    color: var(--text-color-primary);
    position: relative;
    display: flex;
    align-items: center;
    text-align: center;
    column-gap: 0.25rem;
    padding: 0.4rem 1.25rem;
    font-size: 1.05rem;
    z-index: 20;

    .btn-close {
      color: var(--text-color-primary);
      &:hover {
        svg {
          color: var(--text-highlight);
          cursor: pointer;
        }
      }
    }
  }
`;
