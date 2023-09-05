// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

export interface OverlayContextInterface {
  openOverlayWith: (o: React.ReactNode | null, s?: string, t?: boolean) => void;
  closeOverlay: () => void;
  setStatus: (s: number) => void;
  setOverlay: (d: string | null) => void;
  size: string;
  status: number;
  transparent: boolean;
  Overlay: React.ReactNode | null;
}
