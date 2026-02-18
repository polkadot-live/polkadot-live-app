// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { ChainID } from '@polkadot-live/types/chains';
import type { AnyData } from '@polkadot-live/types/misc';

export interface ChainIconProps {
  chainId: ChainID;
  className?: string;
  fill?: string;
  style?: React.CSSProperties;
  width?: number;
}

export interface TriggerRightIconProps {
  text: string;
  theme: AnyData;
  icon: IconDefinition;
  iconTransform?: string;
}
