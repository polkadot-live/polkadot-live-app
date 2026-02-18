// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID } from '@polkadot-live/types/chains';
import type { ReferendaInfo } from '@polkadot-live/types/openGov';

export interface TaskHandlerContextInterface {
  addSubscriptions: (chainId: ChainID, referendumInfo: ReferendaInfo) => void;
  removeSubscriptions: (
    chainId: ChainID,
    referendumInfo: ReferendaInfo,
  ) => void;
}
