// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { motion } from 'framer-motion';
import styled from 'styled-components';

export const Wrapper = styled(motion.div)`
  padding: 0.5rem;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  background-color: var(--background-primary);
  border-top: 1px solid var(--border-primary-color);

  > .inner {
    border-radius: 1rem;
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem 0;

    > section {
      display: flex;
      align-items: center;

      &:first-child {
        flex-grow: 1;

        > .icon {
          color: var(--text-color-secondary);
          margin: 0 1rem 0 0.25rem;
        }

        > .text {
          flex: 1;
          flex-direction: column;
          margin-left: 0.25rem;
        }
      }

      &:last-child {
        flex-shrink: 1;
        justify-content: flex-end;

        > button {
          margin-left: 0.75rem;
        }
      }
    }

    h3,
    h5 {
      font-size: 1.1rem;
      color: #a5a5a5;
      display: flex;
      align-items: center;
      flex: 1;
    }

    h5 {
      margin-top: 0.25rem;
    }
  }
`;
