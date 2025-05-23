// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';

export interface ChainIconProps {
  chainId: ChainID;
  className?: string;
  fill?: string;
  style?: React.CSSProperties;
  width?: number;
}
