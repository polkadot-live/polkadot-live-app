import { browser } from '@wdio/globals';
import type { FlattenedAccountData } from '@/types/accounts';
import type { ChainID } from '@/types/chains';
import type { AccountSource } from '@polkadot-cloud/react/types';
import type { Ignore, MethodSubscription } from '@/types/blockstream';

describe('Account Tests', function () {
  const mockAccount1 = {
    address: '1Sa5eJV8zmuwPTCuhgN42YS6LhNATvXunZXmKTYvGuGhvPT',
    chainId: 'Polkadot' as ChainID,
    name: 'Alice',
    source: 'vault' as AccountSource,
  };

  const mockAccount2 = {
    address: '1DcVoTjzxJSYYvFwUQBwWcq1WhcUgUAsdBZDTM4xeJh8tx3',
    chainId: 'Polkadot' as ChainID,
    name: 'Bob',
    source: 'vault' as AccountSource,
  };

  afterEach(async function () {
    await browser.electron.api('wdio:accounts:clear');
  });

  describe('AccountsController#add', async function () {
    it('should store an account and return it successfully', async function () {
      // Try adding a new account, expect return value to be account
      const result1 = await browser.electron.api('AccountsController#add1', {
        ...mockAccount1,
      });
      const account = result1 as FlattenedAccountData | false;

      if (!account)
        throw new Error('AccountsController#add failed to add account.');

      expect(account.address).toBe(mockAccount1.address);
      expect(account.name).toBe(mockAccount1.name);
    });

    it('should return undefined when adding an existing account', async function () {
      await browser.electron.api('wdio:accounts:add', [mockAccount1]);

      // Try adding the same account, expect return value to be `false`
      const result2 = await browser.electron.api('AccountsController#add2', {
        ...mockAccount1,
      });

      const bool = result2 as boolean;
      expect(bool).toBe(false);
    });
  });

  describe('AccountsController#get', function () {
    it('should retrieve an existing account', async function () {
      await browser.electron.api('wdio:accounts:add', [{ ...mockAccount1 }]);

      const result1 = await browser.electron.api('AccountsController#get1', {
        ...mockAccount1,
      });

      const account = result1 as FlattenedAccountData | false;

      if (!account)
        throw new Error('AccountsController#get failed to get account');

      expect(account.address).toBe(mockAccount1.address);
      expect(account.name).toBe(mockAccount1.name);
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
      await browser.electron.api('wdio:accounts:add', [{ ...mockAccount1 }]);

      // Update an account's name and source
      const updatedParams = {
        name: 'Bob',
        source: 'ledger',
      };

      const result = await browser.electron.api('AccountsController#set', {
        original: { ...mockAccount1 },
        updated: { ...updatedParams },
      });

      const account = result as FlattenedAccountData | false;

      if (!account)
        throw new Error('AccountsController#set failed to update account');

      expect(account.name).toBe(updatedParams.name);
      expect(account.address).toBe(mockAccount1.address);
    });
  });

  describe('AccountsController#pushAccount', function () {
    it('should add an account to the accounts map', async function () {
      await browser.electron.api('wdio:accounts:add', [{ ...mockAccount1 }]);

      const result = await browser.electron.api(
        'AccountsController#pushAccount',
        { ...mockAccount2 }
      );

      const flattenedAccounts = result as FlattenedAccountData[];
      expect(flattenedAccounts).toHaveLength(2);
    });
  });

  // Pending tests
  describe('AccountsController#spliceAccount', function () {
    it('should remove an account from the accounts map successfully', async function () {
      await browser.electron.api('wdio:accounts:add', [
        { ...mockAccount1 },
        { ...mockAccount2 },
      ]);

      const result = await browser.electron.api(
        'AccountsController#spliceAccount1',
        { ...mockAccount1 }
      );

      const flattened = result as FlattenedAccountData[];

      expect(flattened.length).toBe(1);
      expect(flattened[0].address).toBe(mockAccount2.address);
    });

    it("shouldn't modify the accounts map if the provided address doesn't exist", async function () {
      await browser.electron.api('wdio:accounts:add', [
        { ...mockAccount1 },
        { ...mockAccount2 },
      ]);

      const result = await browser.electron.api(
        'AccountsController#spliceAccount2'
      );

      const flattened = result as FlattenedAccountData[];

      expect(flattened.length).toBe(2);
      expect(flattened[0].address).toBe(mockAccount1.address);
      expect(flattened[1].address).toBe(mockAccount2.address);
    });
  });

  describe('AccountsController#setAccountConfig', function () {
    it("should update an account's subscription method successfully", async function () {
      await browser.electron.api('wdio:accounts:add', [{ ...mockAccount1 }]);

      const newConfig: MethodSubscription = {
        type: 'ignore',
        ignore: [{ pallet: 'balances', method: 'palletVersion' }],
      };

      const result = await browser.electron.api(
        'AccountsController#setAccountConfig',
        {
          newConfig: newConfig,
          newAccount: { ...mockAccount1 },
        }
      );

      const account = result as FlattenedAccountData;
      const config = account.config as Ignore;

      expect(config.type).toBe('ignore');
      expect(config.ignore).toHaveLength(1);
      expect(config.ignore[0].pallet).toBe('balances');
      expect(config.ignore[0].method).toBe('palletVersion');
    });
  });

  describe('AccountsController#status', function () {
    it("should return 'active' for newly added accounts with default config 'all'", async function () {
      await browser.electron.api('wdio:accounts:add', [{ ...mockAccount1 }]);

      const result = await browser.electron.api('AccountsController#status1', {
        ...mockAccount1,
      });

      const status = result as string;
      expect(status).toBe('active');
    });

    it("should return 'active' for an account with a set config", async function () {
      await browser.electron.api('wdio:accounts:add', [{ ...mockAccount1 }]);

      const config: MethodSubscription = {
        type: 'ignore',
        ignore: [{ pallet: 'balances', method: 'palletVersion' }],
      };

      const result = await browser.electron.api('AccountsController#status2', {
        config,
        newAccount: { ...mockAccount1 },
      });

      const status = result as string;

      expect(status).toBe('active');
    });
  });

  describe('AccountsController#remove', function () {
    it('should remove an account from the accounts property successfully', async function () {
      await browser.electron.api('wdio:accounts:add', [
        { ...mockAccount1 },
        { ...mockAccount2 },
      ]);

      const result = await browser.electron.api('AccountsController#remove', [
        { ...mockAccount1 },
        { ...mockAccount2 },
      ]);

      const accounts = result as FlattenedAccountData[];
      expect(accounts).toHaveLength(1);
    });
  });

  describe('AccountsController#getDelegatorsOfAddress', function () {
    it('should get delegators for a delegate address');
  });
});
