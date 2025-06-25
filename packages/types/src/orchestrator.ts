// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ChainID, ChainStatus } from './chains';
import type { AnyData } from './misc';
import type { AccountSource } from './accounts';

export interface AppOrchestratorArg {
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
  chainId: ChainID;
  address: string;
}

export interface ReportConnectionStatusArg {
  status: ChainStatus;
  chain: ChainID;
}
