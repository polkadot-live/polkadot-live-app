// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { motion } from 'framer-motion';
import styled from 'styled-components';

// Tabs container.
export const TabsWrapper = styled.div`
  margin-top: 3rem; // header height offset
  user-select: none;
  width: 100%;
  height: 49px;
  background-color: #181818;
  border-bottom: 1px solid #222;
  border-left: 1px solid rgba(70, 70, 70, 0.3);
  border-right: 1px solid rgba(70, 70, 70, 0.3);

  .inner {
    display: flex;
    align-items: center;
    column-gap: 0.75rem;
    height: 100%;
    padding: 0 1.15rem;
  }
`;

// Tab top div.
export const TabWrapper = styled(motion.div)`
  position: relative;
  background-color: #313131;
  border-radius: 0.375rem;
  min-width: 115px;
  padding: 0.3rem 0;
  margin-top: -5px;
  cursor: pointer;

  &:hover {
    background-color: #3d3d3d;
  }

  .inner {
    position: relative;
    display: flex;
    align-items: center;
    text-align: center;
    column-gap: 0.25rem;
    padding: 0.4rem 1.25rem;
    font-size: 1.05rem;
    color: var(--text-color-primary);
    z-index: 20;

    .btn-close {
      color: var(--text-color-primary);
      &:hover {
        svg {
          color: #f1f1f1;
          cursor: pointer;
        }
      }
    }
  }
`;
