// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react';

export type MaybeString = string | null;

export type HelpStatus = 'closed' | 'open' | 'closing';

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

export type HelpItems = HelpItem[];

export type HelpItemKey =
  | 'help:import:vault'
  | 'help:import:ledger'
  | 'help:import:readOnly'
  | 'help:subscription:balances:transfers'
  | 'help:subscription:nominationPools:commission'
  | 'help:subscription:nominationPools:name'
  | 'help:subscription:nominationPools:state'
  | 'help:subscription:nominationPools:roles'
  | 'help:subscription:nominationPools:rewards'
  | 'help:subscription:nominating:commission'
  | 'help:subscription:nominating:exposure'
  | 'help:subscription:nominating:payouts'
  | 'help:subscription:chain:timestamp'
  | 'help:subscription:chain:currentSlot';

export interface HelpItem {
  key: HelpItemKey;
  title: string;
  definition: string[];
}
