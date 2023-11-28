import { browser } from '@wdio/globals';
import type { FlattenedAccountData } from '@/types/accounts';
import type { ChainID } from '@/types/chains';
import type { AccountSource } from '@polkadot-cloud/react/types';

describe('Account Tests', function () {
  it('AccountsController#add', async function () {
    const params = {
      address: '1Sa5eJV8zmuwPTCuhgN42YS6LhNATvXunZXmKTYvGuGhvPT',
      chainId: 'Polkadot' as ChainID,
      name: 'Alice',
      source: 'vault' as AccountSource,
    };

    // Try adding a new account, expect return value to be account
    const result1 = await browser.electron.api(
      'AccountsController#add',
      params
    );
    const account = result1 as FlattenedAccountData | false;

    if (!account) throw Error('AccountsController#add failed to add account.');

    expect(account.address).toBe(params.address);
    expect(account.name).toBe(params.name);

    // Try adding the same account, expect return value to be `false`
    const result2 = await browser.electron.api(
      'AccountsController#add',
      params
    );
    const bool = result2 as boolean;

    expect(bool).toBe(false);
  });
});
