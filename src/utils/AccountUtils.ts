import { AccountsController } from '@/controller/AccountsController';
import { WindowsController } from '@/controller/WindowsController';
import { Discover } from '@/controller/Discover';

export const initializeConfigsAndChainStates = async () => {
  for (const [chainId, accounts] of AccountsController.accounts.entries()) {
    for (const account of accounts) {
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
