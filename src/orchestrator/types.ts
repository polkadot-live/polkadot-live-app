// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountSource, AnyData } from '@polkadot-live/types';
import { ChainID, ChainStatus } from '@polkadot-live/types/chains';

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
