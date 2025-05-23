// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

export const PadlockWrapper = styled.div`
  .padlock,
  .icon2 {
    position: relative;
    cursor: pointer;
  }

  svg {
    width: 13px;
    height: auto;
  }

  .padlock rect,
  .padlock path,
  .icon2 path {
    transition: all 0.2s ease-in-out;
  }

  .padlock rect {
    fill: var(--text-color-secondary);
  }
  .icon2 path#body {
    fill: var(--text-color-secondary);
  }

  .padlock path,
  .icon2 path#hook {
    stroke: var(--text-color-secondary);
    stroke-dasharray: 30;
    stroke-dashoffset: 5;
    fill: none;
  }

  .padlock.green rect,
  .icon2#green path#body {
    fill: var(--text-color-secondary);
  }

  .padlock.green path,
  .icon2.green path#hook {
    stroke: var(--text-color-secondary);
    stroke-dasharray: 20;
  }

  /* keyhole */
  .keyhole {
    width: 3px;
    height: 3px;
    border-radius: 12px;
    position: absolute;
    top: 60%;
    left: 50%;
    background-color: var(--background-surface);
    transform: translate(-50%, -50%) rotate(0deg);
    transition: all 0.2s ease-in-out;
    z-index: 1;
  }

  //.padlock.green .keyhole {
  //  transform: translate(-50%, -50%) rotate(-180deg);
  //}
`;
