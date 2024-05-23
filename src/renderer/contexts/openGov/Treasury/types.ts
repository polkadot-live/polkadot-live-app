// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyData } from '@/types/misc';

export interface TreasuryContextInterface {
  initTreasury: () => void;
  treasuryU8Pk: Uint8Array | null;
  fetchingTreasuryPk: boolean;
  setFetchingTreasuryPk: (fetching: boolean) => void;
  setTreasuryData: (data: AnyData) => void;
  getTreasuryEncodedAddress: () => string | null;
  getFormattedFreeBalance: () => string;
}
