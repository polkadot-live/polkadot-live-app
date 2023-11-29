import { WindowsController } from '@/controller/WindowsController';
import { AccountsController } from '@/controller/AccountsController';
import { Account } from '@/model/Account';
import { AccountType } from '@/types/accounts';
import type { FlattenedAccountData } from '@/types/accounts';
import type { AnyData } from '@/types/misc';

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

    case 'AccountsController#add': {
      const account = AccountsController.add(
        params.chainId,
        params.source,
        params.address,
        params.name
      );

      return account ? account.flattenData() : false;
    }

    case 'AccountsController#get1': {
      AccountsController.add(
        params.chainId,
        params.source,
        params.address,
        params.name
      );

      const account = AccountsController.get(params.chainId, params.address);

      return account ? account.flattenData() : false;
    }

    case 'AccountsController#get2': {
      const account = AccountsController.get(params.chainId, params.address);

      return account ? account.flattenData() : false;
    }

    case 'AccountsController#set': {
      AccountsController.add(
        params.original.chainId,
        params.original.source,
        params.original.address,
        params.original.name
      );

      const account = AccountsController.get(
        params.original.chainId,
        params.original.address
      );

      if (!account) return false;

      account.name = params.updated.name;
      account.source = params.updated.source;

      AccountsController.set(params.original.chainId, account);

      const updated = AccountsController.get(
        params.original.chainId,
        params.original.address
      );

      return updated ? updated.flattenData() : false;
    }

    case 'AccountsController#pushAccount': {
      const chainId = params.acc1.chainId;

      // Add first account to accounts controller
      AccountsController.add(
        chainId,
        params.acc1.source,
        params.acc1.address,
        params.acc1.name
      );

      // Manually pass second account to pushAccount
      const acc2 = new Account(
        chainId,
        AccountType.User,
        params.acc2.source,
        params.acc2.address,
        params.acc2.name
      );

      const result = AccountsController.pushAccount(chainId, acc2);
      const flattened: FlattenedAccountData[] = [];

      for (const accounts of result.values()) {
        accounts.forEach((a) => flattened.push(a.flattenData()));
      }

      return flattened;
    }

    case 'AccountsController#spliceAccount1': {
      // Add two accounts to accounts controller
      for (const account of params) {
        AccountsController.add(
          account.chainId,
          account.source,
          account.address,
          account.name
        );
      }

      // Splice first account
      const result = AccountsController.spliceAccount(params[0].address);
      const flattened: FlattenedAccountData[] = [];

      for (const accounts of result.values()) {
        accounts.forEach((a) => flattened.push(a.flattenData()));
      }

      return flattened;
    }

    case 'AccountsController#spliceAccount2': {
      // Add two accounts to accounts controller
      for (const account of params) {
        AccountsController.add(
          account.chainId,
          account.source,
          account.address,
          account.name
        );
      }

      // Splice address not managed by accounts controller
      const result = AccountsController.spliceAccount('1000');
      const flattened: FlattenedAccountData[] = [];

      for (const accounts of result.values()) {
        accounts.forEach((a) => flattened.push(a.flattenData()));
      }

      return flattened;
    }
    case 'AccountsController#setAccountConfig': {
      const chainId = params.newAccount.chainId;
      const address = params.newAccount.address;

      // Add account to accounts controller
      AccountsController.add(
        chainId,
        params.newAccount.source,
        address,
        params.newAccount.name
      );

      // Get added account
      const account = AccountsController.get(chainId, address);
      if (!account) return false;

      // Change account config
      const config = params.newConfig;
      const chainState = { inNominationPool: null };
      AccountsController.setAccountConfig({ config, chainState }, account);

      // Retrieve updated account
      const updated = AccountsController.get(chainId, address);
      return updated ? updated.flattenData() : false;
    }
  }
}
