import { browser } from '@wdio/globals';
import type { FlattenedAccountData } from '@/types/accounts';
import type { ChainID } from '@/types/chains';
import type { AccountSource } from '@polkadot-cloud/react/types';

describe('Account Tests', function () {
  const params = {
    address: '1Sa5eJV8zmuwPTCuhgN42YS6LhNATvXunZXmKTYvGuGhvPT',
    chainId: 'Polkadot' as ChainID,
    name: 'Alice',
    source: 'vault' as AccountSource,
  };

  describe('AccountsController#add', async function () {
    it('should store an account and return it successfully', async function () {
      // Try adding a new account, expect return value to be account
      const result1 = await browser.electron.api(
        'AccountsController#add',
        params
      );
      const account = result1 as FlattenedAccountData | false;

      if (!account)
        throw new Error('AccountsController#add failed to add account.');

      expect(account.address).toBe(params.address);
      expect(account.name).toBe(params.name);
    });

    it('should return undefined when adding an existing account', async function () {
      // Try adding the same account, expect return value to be `false`
      const result2 = await browser.electron.api(
        'AccountsController#add',
        params
      );
      const bool = result2 as boolean;

      expect(bool).toBe(false);
    });
  });

  describe('AccountsController#get', function () {
    it('should retrieve an existing account', async function () {
      const result1 = await browser.electron.api(
        'AccountsController#get1',
        params
      );
      const account = result1 as FlattenedAccountData | false;

      if (!account)
        throw new Error('AccountsController#get failed to get account');

      expect(account.address).toBe(params.address);
      expect(account.name).toBe(params.name);
    });

    it("should return undefined if an account doesn't exist for a chain", async function () {
      const result2 = await browser.electron.api('AccountsController#get2', {
        chainId: 'Polkadot',
        address: '1000',
      });

      const bool = result2 as FlattenedAccountData | false;

      expect(bool).toBe(false);
    });
  });

  describe('AccountsController#set', function () {
    it("should find and update an account's data based on its address", async function () {
      // Update an account's name and source
      const updatedParams = {
        name: 'Bob',
        source: 'ledger',
      };

      const result = await browser.electron.api('AccountsController#set', {
        original: { ...params },
        updated: { ...updatedParams },
      });

      const account = result as FlattenedAccountData | false;

      if (!account)
        throw new Error('AccountsController#set failed to update account');

      expect(account.name).toBe(updatedParams.name);
      expect(account.address).toBe(params.address);
    });
  });
});
