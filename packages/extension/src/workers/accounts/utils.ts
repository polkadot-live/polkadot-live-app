// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../../controllers';
import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';

export const isAlreadyPersisted = async (
  publicKeyHex: string
): Promise<boolean> => {
  for (const source of [
    'ledger',
    'read-only',
    'vault',
    'wallet-connect',
  ] as AccountSource[]) {
    const stored = (await DbController.get('accounts', source)) as
      | ImportedGenericAccount[]
      | undefined;
    if ((stored || []).find((a) => a.publicKeyHex === publicKeyHex)) {
      return true;
    }
  }
  return false;
};
