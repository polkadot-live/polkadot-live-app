// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '@/types/misc';
import type { ChainID } from '@/types/chains';

type Origin = string;

export interface ReferendaContextInterface {
  referenda: Map<Origin, AnyData[]>;
  fetchingReferenda: boolean;
  activeReferendaChainId: ChainID;
  setReferenda: (referenda: Map<Origin, AnyData[]>) => void;
  setActiveReferendaChainId: (chainId: ChainID) => void;
  setFetchingReferenda: (flag: boolean) => void;
}
