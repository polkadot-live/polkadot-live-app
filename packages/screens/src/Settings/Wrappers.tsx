// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { motion } from 'framer-motion';
import styled from 'styled-components';
import { mixinHelpIcon } from '@polkadot-live/styles';

export const SettingWrapper = styled(motion.div)`
  position: relative;
  display: flex;
  width: 100%;
  column-gap: 1rem;
  padding: 1rem;
  font-size: 1.04rem;

  .left {
    flex: 1;
    display: flex;
    align-items: center;
    column-gap: 0.5rem;
    min-width: 0; // Allow title overflow.
  }
  .right {
    display: flex;
    align-items: center;
    justify-content: end;
  }
  .icon-wrapper {
    ${mixinHelpIcon}
    margin-top: -1px;
    color: var(--text-dimmed);
    font-size: 1rem;
    transition: color 0.2s ease-out;

    &:hover {
      color: var(--text-highlight);
    }
  }
`;
