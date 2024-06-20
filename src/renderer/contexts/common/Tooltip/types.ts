// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { CSSProperties } from 'react';
import type React from 'react';

export interface TooltipContextInterface {
  openTooltip: () => void;
  closeTooltip: () => void;
  setTooltipPosition: (x: number, y: number) => void;
  showTooltip: () => void;
  setTooltipTextAndOpen: (t: string, align?: string) => void;
  wrapWithTooltip: (
    Inner: React.ReactNode,
    tooltipText: string,
    styles?: CSSProperties
  ) => JSX.Element;
  wrapWithOfflineTooltip: (
    Inner: React.ReactNode,
    isConnected: boolean,
    tooltipText?: string,
    styles?: CSSProperties
  ) => JSX.Element | React.ReactNode;
  alignRef: React.MutableRefObject<string> | null;
  open: number;
  show: number;
  position: [number, number];
  text: string;
}
