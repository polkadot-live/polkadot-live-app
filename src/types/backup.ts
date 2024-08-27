// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface ExportResult {
  result: boolean;
  msg: string;
}

export interface ImportResult {
  result: boolean;
  msg: string;
  data?: {
    serialized: string;
  };
}
