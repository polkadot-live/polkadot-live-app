// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { motion } from 'framer-motion';
import styled from 'styled-components';

export const ContentWrapper = styled.div`
  width: 100%;
  position: relative;
  padding: 1.5rem;
  background-color: var(--background-modal);

  .flex-column {
    display: flex;
    flex-direction: column;
    row-gap: 1rem;
    margin: 0.5rem 0;
  }
`;

export const SettingWrapper = styled(motion.div)`
  display: flex;
  column-gap: 1rem;

  background: var(--background-default);
  border: 1px solid var(--border-primary-color);
  width: 100%;
  position: relative;
  border-radius: 1.25rem;
  padding: 1rem 1.25rem;

  .left {
    flex: 1;
    display: flex;
    align-items: center;
    column-gap: 1rem;
  }
  .right {
    display: flex;
    align-items: center;
    justify-content: end;
  }
  .icon-wrapper {
    padding: 0 0.3rem;
    color: #4a4a4a;
    cursor: pointer;
    transform: color 0.2s ease-out;

    &:hover {
      color: #953254;
    }
  }
`;

export const HeadingWrapper = styled.div`
  margin-bottom: 1rem;
  width: 100%;
  z-index: 3;
  opacity: 0.75;
  user-select: none;
  cursor: pointer;

  .flex {
    display: flex;
    column-gap: 0.5rem;
    align-items: center;
    padding: 0.25rem 0;
    transition: background-color 0.15s ease-in-out;
    border-bottom: 1px solid var(--border-secondary-color);

    &:hover {
      background-color: #141414;
    }
    > div {
      display: flex;
      flex-direction: row;
      align-items: center;
      column-gap: 1rem;
      padding: 0.5rem;
    }

    .left {
      flex: 1;
      display: flex;
      column-gap: 0.75rem;
      justify-content: flex-start;

      .icon-wrapper {
        min-width: 0.75rem;
        opacity: 0.4;
      }
      h5 {
        font-size: 0.95rem;
        > span {
          color: var(--text-color-primary);
        }
      }
    }
    .right {
      display: flex;
      justify-content: flex-end;
    }
  }
`;
