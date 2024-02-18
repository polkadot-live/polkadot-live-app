// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { WindowsController } from '@/controller/WindowsController';
import { AccountsController } from '@/controller/AccountsController';
import type { FlattenedAccountData } from '@/types/accounts';
import type { AnyData } from '@/types/misc';
import type { ChainID } from '@/types/chains';

export function handleWdioApi(cmd: string, params?: AnyData) {
  switch (cmd) {
    //--------------------------------------------------
    // Main Window Tests
    //--------------------------------------------------

    case 'toggleMainWindow': {
      WindowsController.toggleVisible('menu');
      break;
    }

    //--------------------------------------------------
    // Account Tests
    //--------------------------------------------------

    case 'wdio:accounts:clear': {
      const addressMap = new Map<ChainID, string[]>();

      // Collect addresses to remove from accounts controller
      for (const [chainId, accounts] of AccountsController.accounts.entries()) {
        addressMap.set(
          chainId,
          accounts.map((a) => a.address)
        );
      }

      // Remove addresses from accounts controller
      for (const [chainId, addresses] of addressMap.entries()) {
        for (const address of addresses) {
          AccountsController.remove(chainId, address);
        }
      }

      break;
    }

    case 'wdio:accounts:add': {
      for (const account of params) {
        AccountsController.add(
          account.chainId,
          account.source,
          account.address,
          account.name
        );
      }
      break;
    }

    case 'AccountsController#add1': {
      const account = AccountsController.add(
        params.chainId,
        params.source,
        params.address,
        params.name
      );

      return account ? account.flatten() : false;
    }

    case 'AccountsController#add2': {
      // Try adding the same account
      const account = AccountsController.add(
        params.chainId,
        params.source,
        params.address,
        params.name
      );

      return account ? account.flatten() : false;
    }

    case 'AccountsController#get1': {
      const account = AccountsController.get(params.chainId, params.address);

      return account ? account.flatten() : false;
    }

    case 'AccountsController#get2': {
      const account = AccountsController.get(params.chainId, params.address);

      return account ? account.flatten() : false;
    }

    case 'AccountsController#set': {
      // Retrieve added account
      const account = AccountsController.get(
        params.original.chainId,
        params.original.address
      );

      if (!account) {
        return false;
      }

      // Update account's information
      account.name = params.updated.name;
      account.source = params.updated.source;

      AccountsController.set(params.original.chainId, account);

      // Get updated account
      const updated = AccountsController.get(
        params.original.chainId,
        params.original.address
      );

      // Return updated account's flattened data
      return updated ? updated.flatten() : false;
    }

    case 'AccountsController#spliceAccount1': {
      // Splice first account
      const result = AccountsController.spliceAccount(params.address);
      const flattened: FlattenedAccountData[] = [];

      for (const accounts of result.values()) {
        accounts.forEach((a) => flattened.push(a.flatten()));
      }

      return flattened;
    }

    case 'AccountsController#spliceAccount2': {
      // Splice address not managed by accounts controller
      const result = AccountsController.spliceAccount('1000');
      const flattened: FlattenedAccountData[] = [];

      for (const accounts of result.values()) {
        accounts.forEach((a) => flattened.push(a.flatten()));
      }

      return flattened;
    }

    case 'AccountsController#remove': {
      // Remove the first account
      const chainId = params[0].chainId;
      const address = params[0].address;

      AccountsController.remove(chainId, address);

      // Return flattened data of remaining accounts
      const flattened: FlattenedAccountData[] = [];
      for (const accounts of AccountsController.accounts.values()) {
        accounts.forEach((a) => flattened.push(a.flatten()));
      }

      return flattened;
    }
  }
}
