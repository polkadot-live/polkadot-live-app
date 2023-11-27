import { AccountsController } from '@/controller/AccountsController';
import { WindowsController } from '@/controller/WindowsController';
import { Discover } from '@/controller/Discover';
import type { ChainID } from '@/types/chains';

export const initializeConfigsAndChainStates = async () => {
  for (const chain of Object.keys(AccountsController.accounts)) {
    const accounts = AccountsController.accounts[chain];
    for (const account of accounts) {
      const chainId = chain as ChainID;
      const { chainState, config } = await Discover.start(chainId, account);

      account.config = config;
      account.chainState = chainState;
      AccountsController.set(chainId, account);
    }
  }

  // Report accounts to windows with updated configs.
  for (const { id } of WindowsController.active) {
    WindowsController.get(id)?.webContents?.send(
      'renderer:broadcast:accounts',
      AccountsController.getAllFlattenedAccountData()
    );
  }
};
