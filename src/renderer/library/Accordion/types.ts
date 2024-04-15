// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyFunction } from '@w3ux/utils/types';

export interface AccordionProps {
  children: React.ReactNode;
  multiple: boolean | string;
  defaultIndex: number | number[];
  setExternalIndices?: AnyFunction;
}
