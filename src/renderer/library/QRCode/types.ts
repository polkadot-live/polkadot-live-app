// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { HexString } from '@polkadot/util/types';
import type React from 'react';

export interface FrameState {
  frames: Uint8Array[];
  frameIdx: number;
  image: string | null;
  valueHash: string | null;
}

export interface ScanType {
  signature: HexString;
}

export interface TimerState {
  timerDelay: number;
  timerId: ReturnType<typeof setTimeout> | null;
}

export interface DisplayProps {
  className?: string | undefined;
  size?: string | number | undefined;
  skipEncoding?: boolean;
  style?: React.CSSProperties | undefined;
  timerDelay?: number | undefined;
  value: Uint8Array;
}

export interface DisplayPayloadProps {
  address: string;
  className?: string;
  cmd: number;
  genesisHash: Uint8Array | string;
  payload: Uint8Array;
  size?: string | number;
  style?: React.CSSProperties;
  timerDelay?: number;
}

export interface ScanSignatureProps {
  className?: string;
  onError?: (error: Error) => void;
  onScan: (scanned: ScanType) => void;
  size?: string | number;
  style?: React.CSSProperties;
}
