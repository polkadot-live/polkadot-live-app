// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../../controllers';
import { isAlreadyPersisted } from './utils';
import type {
  AccountSource,
  ImportedGenericAccount,
} from '@polkadot-live/types/accounts';

export const deleteAccount = async (
  publicKeyHex: string,
  source: AccountSource
): Promise<boolean> => {
  try {
    const all = ((await DbController.get('accounts', source)) ||
      []) as ImportedGenericAccount[];
    const updated = all.filter((a) => a.publicKeyHex !== publicKeyHex);
    await DbController.set('accounts', source, updated);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const persistAccount = async (account: ImportedGenericAccount) => {
  try {
    const { publicKeyHex, source } = account;
    const alreadyExists = await isAlreadyPersisted(publicKeyHex);
    if (!alreadyExists) {
      const all = (await DbController.get('accounts', source)) as
        | ImportedGenericAccount[]
        | undefined;
      await DbController.set('accounts', source, [...(all || []), account]);
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const updateAccount = async (account: ImportedGenericAccount) => {
  try {
    const { publicKeyHex, source } = account;
    const all = (await DbController.get('accounts', source)) as
      | ImportedGenericAccount[]
      | undefined;
    const updated = (all || []).map((a) =>
      a.publicKeyHex === publicKeyHex ? account : a
    );
    await DbController.set('accounts', source, updated);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
