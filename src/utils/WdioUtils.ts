import { WindowsController } from '@/controller/WindowsController';
import { AccountsController } from '@/controller/AccountsController';
import { Account } from '@/model/Account';
import { AccountType } from '@/types/accounts';
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
      const addressMap: Map<ChainID, string[]> = new Map();

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

      if (!account) return false;

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

    case 'AccountsController#pushAccount': {
      const chainId = params.chainId;

      // Manually pass second account to pushAccount
      const acc2 = new Account(
        chainId,
        AccountType.User,
        params.source,
        params.address,
        params.name
      );

      const result = AccountsController.pushAccount(chainId, acc2);
      const flattened: FlattenedAccountData[] = [];

      for (const accounts of result.values()) {
        accounts.forEach((a) => flattened.push(a.flatten()));
      }

      return flattened;
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

    case 'AccountsController#setAccountConfig': {
      const chainId = params.newAccount.chainId;
      const address = params.newAccount.address;

      // Get added account
      const account = AccountsController.get(chainId, address);
      if (!account) return false;

      // Change account config
      const config = params.newConfig;
      const chainState = { inNominationPool: null };
      AccountsController.setAccountConfig({ config, chainState }, account);

      // Retrieve updated account
      const updated = AccountsController.get(chainId, address);
      return updated ? updated.flatten() : false;
    }

    case 'AccountsController#status1': {
      const chainId = params.chainId;
      const address = params.address;

      // Add account to accounts controller
      AccountsController.add(chainId, params.source, address, params.name);

      // Return added account status
      return AccountsController.status(chainId, address);
    }

    case 'AccountsController#status2': {
      const chainId = params.newAccount.chainId;
      const address = params.newAccount.address;

      // Get added account
      const account = AccountsController.get(chainId, address);
      if (!account) return false;

      // Change account config
      const config = params.config;
      const chainState = { inNominationPool: null };
      AccountsController.setAccountConfig({ config, chainState }, account);

      // Get account status
      return AccountsController.status(chainId, address);
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
