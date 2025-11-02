// Copyright 2025 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { DbController } from '../../../controllers';
import {
  deleteAccount,
  getAllAccounts,
  handleGetSpendableBalance,
  handleImportAddress,
  handleRemoveAddress,
  handleRenameAccount,
  persistAccount,
  updateAccount,
} from '../../accounts';
import { getSharedState } from '../../state';
import type { AccountSource } from '@polkadot-live/types/accounts';
import type { AnyData } from '@polkadot-live/types/misc';
import type { ChainID } from '@polkadot-live/types/chains';

export const handleAccountMessage = (
  message: AnyData,
  sendResponse: (response?: AnyData) => void
): boolean => {
  switch (message.task) {
    case 'getAll': {
      getAllAccounts().then((result) => sendResponse(result));
      return true;
    }
    case 'getAllBySource': {
      const { source }: { source: AccountSource } = message.payload;
      DbController.get('accounts', source).then((result) =>
        sendResponse(result)
      );
      return true;
    }
    case 'getSpendableBalance': {
      const { address, chainId }: { address: string; chainId: ChainID } =
        message.payload;
      handleGetSpendableBalance(address, chainId).then((res) =>
        sendResponse(res.toString())
      );
      return true;
    }
    case 'delete': {
      const {
        publicKeyHex,
        source,
      }: { publicKeyHex: string; source: AccountSource } = message.payload;
      deleteAccount(publicKeyHex, source).then((res) => sendResponse(res));
      return true;
    }
    case 'persist': {
      const { account } = message.payload;
      persistAccount(account).then((res) => sendResponse(res));
      return true;
    }
    case 'update': {
      const { account } = message.payload;
      updateAccount(account).then((res) => sendResponse(res));
      return true;
    }
    case 'importAddress': {
      const { encodedAccount, genericAccount } = message.payload;
      const isOnline =
        Boolean(getSharedState().get('mode:connected')) &&
        Boolean(getSharedState().get('mode:online'));
      handleImportAddress(genericAccount, encodedAccount, isOnline, false);
      return false;
    }
    case 'removeAddress': {
      const { address, chainId } = message.payload;
      handleRemoveAddress(address, chainId);
      return false;
    }
    case 'renameAccount': {
      const { account } = message.payload;
      handleRenameAccount(account).then((res) => sendResponse(res));
      return true;
    }
    default: {
      console.warn(`Unknown account task: ${message.task}`);
      return false;
    }
  }
};
