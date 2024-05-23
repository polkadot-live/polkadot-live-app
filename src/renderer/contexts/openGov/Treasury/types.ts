// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface TreasuryContextInterface {
  treasuryU8Pk: Uint8Array | null;
  fetchingTreasuryPk: boolean;
  setTreasuryU8Pk: (pk: Uint8Array | null) => void;
  setFetchingTreasuryPk: (fetching: boolean) => void;
}
