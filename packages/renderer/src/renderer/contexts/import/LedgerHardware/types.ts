// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { LedgerResponse } from '@polkadot-live/types/ledger';
import type { AnyData } from 'packages/types/src';
import type { LedgerNetworkData } from '.';

export interface LedgerHardwareContextInterface {
  isFetching: boolean;
  isImporting: boolean;
  deviceConnected: boolean;
  statusCodes: LedgerResponse[];
  setIsFetching: React.Dispatch<React.SetStateAction<boolean>>;
  setIsImporting: React.Dispatch<React.SetStateAction<boolean>>;
  setDeviceConnected: React.Dispatch<React.SetStateAction<boolean>>;
  setStatusCodes: React.Dispatch<React.SetStateAction<LedgerResponse[]>>;
  handleNewStatusCode: (ack: string, statusCode: string) => void;
  fetchLedgerAddresses: (network: string, offset: number) => void;
  statusCodesRef: AnyData;
  networkData: LedgerNetworkData[];
}
