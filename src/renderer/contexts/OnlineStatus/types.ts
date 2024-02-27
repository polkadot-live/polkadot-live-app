// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface OnlineStatusInterface {
  online: boolean;
  setOnline: (b: boolean) => void;
}
