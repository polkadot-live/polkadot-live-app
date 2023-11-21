// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID, ChainStatus } from './chains';
import type { AnyData } from './misc';
import type { AccountSource } from './accounts';

export type OrchestratorArg = {
  task: string;
  data?: AnyData;
};

export type ImportNewAddressArg = {
  chain: ChainID;
  source: AccountSource;
  address: string;
  name: string;
};

export type RemoveImportedAccountArg = {
  chain: ChainID;
  address: string;
};

export type ReportConnectionStatusArg = {
  status: ChainStatus;
  chain: ChainID;
};
