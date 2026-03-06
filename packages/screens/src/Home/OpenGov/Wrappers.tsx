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

export const RefChevron = CardChevron;
export const RefCard = Card;
export const RefCardContent = CardContent;
export const RefIconCircle = IconCircle;
export const RefStatsRow = StatsRow;
export const RefSubCountBadge = CountBadge;

export const RefCardHeader = (props: AnyData) => (
  <CardHeader direction="row" {...props} />
);

export const RefName = (props: AnyData) => <Title $grow={true} {...props} />;

export default {};
