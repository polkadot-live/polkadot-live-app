// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface TreasuryContextInterface {
  initTreasury: () => void;
  treasuryU8Pk: Uint8Array | null;
  fetchingTreasuryPk: boolean;
  setFetchingTreasuryPk: (fetching: boolean) => void;
  setTreasuryPk: (pk: Uint8Array) => void;
  getTreasuryEncodedAddress: () => string | null;
}
