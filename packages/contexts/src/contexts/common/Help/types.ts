// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { HelpItem, HelpStatus } from '@polkadot-live/types/help';
import type { ReactNode } from 'react';

export type MaybeString = string | null;

export interface HelpContextProps {
  children: ReactNode;
}

export interface HelpContextState {
  status: HelpStatus;
  item: HelpItem | null;
}

export interface DefinitionWithKeys {
  title: string;
  description: string[];
}

export interface ExternalWithKeys {
  title: string;
  url: string;
  website?: string;
}

export type HelpConfig = Map<string, string | string[]>;
