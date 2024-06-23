// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyFunction } from '@/types/misc';

export interface AccordionProps {
  children: React.ReactNode;
  multiple?: boolean | string;
  defaultIndex: number | number[];
  indicesRef?: React.MutableRefObject<number[]>;
  setExternalIndices?: AnyFunction;
}

export interface AccordionCaretHeaderProps {
  title: string;
  itemIndex: number;
  wide?: boolean;
}

export interface AccordionCaretSwitchHeaderProps {
  title: string;
  itemIndex: number;
  SwitchComponent: React.ReactNode;
}
