// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const ShiftingMeterWrapper = styled.div`
  position: relative;

  .shifting-wrap {
    display: flex;
    justify-content: start;
    overflow: hidden;
  }

  .shifting-digits {
    transform: 1s all;
    transition-timing-function: cubic-bezier(0, 0.99, 1, 1.01);
  }
  .shifting-digit {
    position: absolute;
    backface-visibility: hidden;
    transform-style: preserve-3d;
  }
`;
