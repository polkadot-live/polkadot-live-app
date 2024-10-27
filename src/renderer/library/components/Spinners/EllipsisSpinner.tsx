// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { EllipsisSpinnerWrapper } from './EllipsisSpinner.styles';
import type { EllipsisSpinnerProps } from './types';

// Note: Add inside a relative container for correct positioning.
export const EllipsisSpinner: React.FC<EllipsisSpinnerProps> = ({
  style,
}: EllipsisSpinnerProps) => (
  <EllipsisSpinnerWrapper style={{ ...style }}>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </EllipsisSpinnerWrapper>
);
