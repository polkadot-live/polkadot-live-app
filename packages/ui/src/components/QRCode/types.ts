// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type React from 'react';
import type { HexString } from '@dedot/utils';
import type { Html5Qrcode } from 'html5-qrcode';

export interface Html5QrScannerProps {
  fps: number;
  qrCodeSuccessCallback: (data: string | null) => void;
  qrCodeErrorCallback: (error: string) => void;
  html5QrCode: Html5Qrcode | null;
}

export interface FrameState {
  frames: Uint8Array[];
  frameIdx: number;
  image: string | null;
  valueHash: string | null;
}

export interface ScanType {
  signature: HexString;
}

export interface DisplayProps {
  className?: string | undefined;
  size?: string | number | undefined;
  style?: React.CSSProperties | undefined;
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
}

/**
 * @deprecated This type should not be used.
 */
export interface ScanSignatureProps {
  className?: string;
  onError?: (error: Error) => void;
  onScan: (scanned: ScanType) => void;
  size?: string | number;
  style?: React.CSSProperties;
}
