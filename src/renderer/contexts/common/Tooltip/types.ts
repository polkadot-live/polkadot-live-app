// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface TooltipContextInterface {
  openTooltip: () => void;
  closeTooltip: () => void;
  setTooltipPosition: (x: number, y: number) => void;
  showTooltip: () => void;
  setTooltipTextAndOpen: (t: string, align?: string) => void;
  alignRef: React.MutableRefObject<string>;
  open: number;
  show: number;
  position: [number, number];
  text: string;
}
