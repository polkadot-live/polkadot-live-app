// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { motion } from 'framer-motion';
import styled from 'styled-components';

export const ExpandButtonWrapper = styled(motion.div)`
  position: relative;
  width: 100%;
  min-height: 50px;
  padding: 0.5rem;
  font-size: 1.25rem;
  line-height: 1.75rem;
`;

export const NavItemWrapper = styled(motion.button).attrs<{ $size: string }>(
  (props) => ({
    $size: props.$size,
  })
)`
  width: ${(props) => (props.$size === 'fill' ? '90%' : '65%')};
  min-height: ${(props) => (props.$size === 'fill' ? '72px' : '45px')};
  position: relative;
  padding: 0.5rem;
  font-size: 1.25rem;
  line-height: 1.75rem;
  background-color: #313131;
  border: none;
  border-radius: 0.375rem;
  color: #c9c9c9;
  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke, width, height;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
  cursor: pointer;

  &:hover {
    background-color: #3d3d3d;
  }

  .children-container {
    display: block;
    position: relative;
    z-index: 10;

    h2 {
      font-size: 0.95rem;
      font-weight: 600;
      margin-top: 0.5rem;
    }
  }
`;

export const SideNavWrapper = styled.nav<{ $isCollapsed: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-self: stretch;
  max-width: ${(props) => (props.$isCollapsed ? '74px' : '98px')};
  background-color: #1a1919;
  padding: ${(props) => (props.$isCollapsed ? '0' : '0 0.7rem')};
  padding-top: 2rem;
  padding-bottom: 1rem;
  align-items: center;
  gap: 0.75rem;
  overflow-y: auto;
  border-top: 1px solid var(--border-primary-color);
`;
