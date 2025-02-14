// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type React from 'react';

export interface OverlayContextInterface {
  setOnCloseOverlay: (onClosePrompt: (() => void) | null) => void;
  openOverlayWith: (o: React.ReactNode | null, s?: string, t?: boolean) => void;
  closeOverlay: () => void;
  setStatus: (s: number) => void;
  setOverlay: (d: string | null) => void;
  setDisableClose: (d: boolean) => void;
  size: string;
  status: number;
  transparent: boolean;
  Overlay: React.ReactNode | null;
  disableClose: boolean;
}
