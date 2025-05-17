// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  HelpItemKey,
  HelpItem,
  HelpStatus,
} from '@polkadot-live/types/help';
import type { ReactNode } from 'react';

export type MaybeString = string | null;

export interface HelpContextInterface {
  openHelp: (d: HelpItemKey) => void;
  closeHelp: () => void;
  setStatus: (s: HelpStatus) => void;
  setDefinition: (d: HelpItemKey) => void;
  status: HelpStatus;
  definition: HelpItem | null;
}

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
