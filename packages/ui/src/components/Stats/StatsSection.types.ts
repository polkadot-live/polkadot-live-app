// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyFunction } from '@polkadot-live/types/misc';

export interface StatsSectionProps {
  title: string;
  btnText: string;
  btnClickHandler: AnyFunction;
  children: React.ReactNode;
}
