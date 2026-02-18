// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { AnyFunction } from '@polkadot-live/types/misc';

export interface SortControlsButtonProps {
  isActive: boolean;
  isDisabled: boolean;
  onLabel?: string;
  offLabel?: string;
  fixedWidth?: boolean;
  onClick?: AnyFunction;
  faIcon?: IconDefinition;
  respClass?: string;
}

export interface SortControlLabelProps {
  label?: string;
  faIcon?: IconDefinition;
  noBorder?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
