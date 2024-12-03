// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { PadlockWrapper } from './Wrapper';
import type { PadlockProps } from './types';

export const Padlock = ({ locked, onClick }: PadlockProps) => (
  <PadlockWrapper>
    <div
      className={`padlock ${locked ? '' : 'green'}`}
      style={{ marginLeft: '0.15rem', marginTop: '0.25rem' }}
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
