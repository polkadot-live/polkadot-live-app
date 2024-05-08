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
