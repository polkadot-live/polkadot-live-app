// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ReactElement } from 'react';

export type DisplayFor = 'default' | 'modal' | 'canvas';

export interface TxProps {
  // whether there is margin on top.
  margin?: boolean;
  // account type for the transaction signing.
  label: string;
  // account id
  TxSigner: ReactElement;
  // whether there is enough funds for the transaction.
  notEnoughFunds: boolean;
  // warning messgae.
  dangerMessage: string;
  // for estimated fee.
  EstimatedFee: ReactElement;
  // signing component.
  SignerComponent: ReactElement;
  // display for.
  displayFor?: DisplayFor;
}
