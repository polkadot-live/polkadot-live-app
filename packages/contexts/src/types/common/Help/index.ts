// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
  HelpItem,
  HelpItemKey,
  HelpStatus,
} from '@polkadot-live/types/help';

export interface HelpContextInterface {
  openHelp: (d: HelpItemKey) => void;
  closeHelp: () => void;
  setStatus: (s: HelpStatus) => void;
  setDefinition: (d: HelpItemKey) => void;
  status: HelpStatus;
  definition: HelpItem | null;
}
