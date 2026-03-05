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
  Subtitle,
  Title,
} from '../Wrappers';
import type { AnyData } from '@polkadot-live/types';

export const AccountChevron = CardChevron;
export const AccountCard = Card;
export const AccountIconCircle = IconCircle;
export const AccountCardContent = CardContent;
export const AccountStatsRow = StatsRow;
export const AccountCountBadge = CountBadge;

export const AccountCardHeader = (props: AnyData) => (
  <CardHeader direction="column" {...props} />
);

export const AccountName = (props: AnyData) => (
  <Title $grow={false} {...props} />
);

export const AccountAddress = Subtitle;
