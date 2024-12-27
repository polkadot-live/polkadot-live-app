// Copyright 2024 @polkadot-live/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import * as defaults from './defaults';
import { createContext, useContext } from 'react';
import type { WalletConnectContextInterface } from './types';

export const WalletConnectContext =
  createContext<WalletConnectContextInterface>(
    defaults.defaultWalletConnectContext
  );

export const useWalletConnect = () => useContext(WalletConnectContext);

export const WalletConnectProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  console.log('todo');

  return (
    <WalletConnectContext.Provider value={{}}>
      {children}
    </WalletConnectContext.Provider>
  );
};
