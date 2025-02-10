// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ExtrinsicInfo } from 'packages/types/src';

export interface ExtrinsicItemContentProps {
  info: ExtrinsicInfo;
}

export interface SubmitProps {
  info: ExtrinsicInfo;
  valid: boolean;
}
