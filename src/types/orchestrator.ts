// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID, ChainStatus } from './chains';
import type { AnyData } from './misc';
import type { AccountSource } from './accounts';

export interface OrchestratorArg {
  task: string;
  data?: AnyData;
}

export interface ImportNewAddressArg {
  chain: ChainID;
  source: AccountSource;
  address: string;
  name: string;
}

export interface RemoveImportedAccountArg {
  chain: ChainID;
  address: string;
}

export interface ReportConnectionStatusArg {
  status: ChainStatus;
  chain: ChainID;
}
