// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { IconProp } from '@fortawesome/fontawesome-svg-core';

export interface OpenViewButtonProps {
  icon: IconProp;
  target: string;
  title: string;
  umamiEvent: string;
}
export type SummaryAccordionValue =
  | 'summary-accounts'
  | 'summary-events'
  | 'summary-subscriptions';
