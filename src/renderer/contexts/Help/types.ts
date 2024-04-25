// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactNode } from 'react';

export type MaybeString = string | null;

export type HelpStatus = 'closed' | 'open' | 'closing';

export interface HelpContextInterface {
  openHelp: (d: MaybeString) => void;
  closeHelp: () => void;
  setStatus: (s: HelpStatus) => void;
  setDefinition: (d: MaybeString) => void;
  status: HelpStatus;
  definition: MaybeString;
}

export interface HelpContextProps {
  children: ReactNode;
}

export interface HelpContextState {
  status: HelpStatus;
  definition: MaybeString;
}
