// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
  Card,
  CardChevron,
  CardContent,
  CardHeader,
  CountBadge,
  IconCircle,
  StatsRow,
  Title,
} from '../Wrappers';
import type { AnyData } from '@polkadot-live/types';

export const NetworkChevron = CardChevron;
export const NetworkCard = Card;
export const NetworkCardContent = CardContent;
export const NetworkIconCircle = IconCircle;
export const NetworkStatsRow = StatsRow;
export const SubCountBadge = CountBadge;

export const NetworkCardHeader = (props: AnyData) => (
  <CardHeader direction="row" {...props} />
);

export const NetworkName = (props: AnyData) => (
  <Title $grow={true} {...props} />
);
