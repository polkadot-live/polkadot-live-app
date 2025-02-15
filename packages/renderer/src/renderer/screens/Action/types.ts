// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '@polkadot-live/types/misc';
import type { ExtrinsicInfo } from 'packages/types/src';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface ExtrinsicItemContentProps {
  info: ExtrinsicInfo;
}

export interface SubmitProps {
  info: ExtrinsicInfo;
  valid: boolean;
}

export interface TriggerRightIconProps {
  text: string;
  theme: AnyData;
  icon: IconDefinition;
  iconTransform?: string;
}
