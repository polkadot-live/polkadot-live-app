// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const ShiftingMeterWrapper = styled.div`
  position: relative;

  .shifting-wrap {
    display: flex;
    justify-content: start;
    overflow: hidden;

    div {
      font-size: 1.1rem;
    }
  }

  .shifting-digits {
    transform: 1s all;
    transition-timing-function: cubic-bezier(0, 0.99, 1, 1.01);
  }
`;
