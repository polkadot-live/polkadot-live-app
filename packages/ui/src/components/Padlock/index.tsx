// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import styled from 'styled-components';

const PadlockWrapper = styled.div`
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
    width: 4px;
    height: 4px;
    border-radius: 12px;
    position: absolute;
    top: 60%;
    left: 50%;
    background-color: black;
    transform: translate(-50%, -50%) rotate(0deg);
    transition: all 0.2s ease-in-out;
    z-index: 1;
  }

  //.padlock.green .keyhole {
  //  transform: translate(-50%, -50%) rotate(-180deg);
  //}
`;

interface PadlockProps {
  locked: boolean;
  onClick: () => void;
}

export const Padlock = ({ locked, onClick }: PadlockProps) => (
  <PadlockWrapper>
    <div
      className={`padlock ${locked ? '' : 'green'}`}
      style={{ marginLeft: '0.25rem', marginTop: '0.15rem' }}
      onClick={onClick}
    >
      <div className="keyhole"></div>
      <svg viewBox="0 0 22 25">
        <rect
          x="0.505493"
          y="10.1519"
          width="21.3777"
          height="14.2868"
          rx="3"
        />
        <path
          d="M5.73621 10.4592V7.32508C5.73621 4.31064 8.1799 1.86694 11.1943 1.86694V1.86694C14.2088 1.86694 16.6525 4.31064 16.6525 7.32508V10.4592"
          strokeWidth="3.5"
        />
      </svg>
    </div>
  </PadlockWrapper>
);
