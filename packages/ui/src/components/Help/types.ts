// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { HelpItem, HelpStatus } from '@polkadot-live/types/help';

export interface HelpProps {
  status: HelpStatus;
  definition: HelpItem | null;
  closeHelp: () => void;
  setStatus: (status: HelpStatus) => void;
}
