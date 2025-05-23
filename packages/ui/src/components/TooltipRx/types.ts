// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '@polkadot-live/types/misc';

export interface RadixTooltipProps {
  children: React.ReactNode;
  text: string;
  theme: AnyData;
  style?: React.CSSProperties;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: 'top' | 'right' | 'bottom' | 'left';
}
