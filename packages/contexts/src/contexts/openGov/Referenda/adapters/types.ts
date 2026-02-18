// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReferendaInfo } from '@polkadot-live/types';
import type { ChainID } from '@polkadot-live/types/chains';

export interface ReferendaAdapter {
  requestReferenda: (chainId: ChainID) => Promise<ReferendaInfo[] | null>;
  getPolkassemblyFlag: () => Promise<boolean>;
}
