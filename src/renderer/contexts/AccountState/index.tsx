// Copyright 2024 @rossbulat/polkadot-live-app authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { setStateWithRef } from '@w3ux/utils';
import { useContext, createContext, useState, useRef } from 'react';
import type { ChainID } from '@/types/chains';
import type { AccountState, AccountStateContextInterface } from './types';
import { defaultAccountState } from './defaults';
import type { AnyJson } from '@/types/misc';

export const AccountStateContext =
  createContext<AccountStateContextInterface>(defaultAccountState);

export const useAccountState = () => useContext(AccountStateContext);

export const AccountStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Store the state of the currently active chain accounts
  const [accountState, setAccountState] = useState<AccountState>();
  const accountStateRef = useRef(accountState);

  // Setter to update account state.
  const setAccountStateKey = (
    chain: ChainID,
    address: string,
    key: string,
    value: AnyJson
  ) => {
    const prevState = { ...accountStateRef.current };
    const newState = {
      ...prevState,
      [chain]: {
        ...prevState[chain],
        [address]: {
          ...prevState[chain]?.[address],
          [key]: value,
        },
      },
    };

    setStateWithRef(newState, setAccountState, accountStateRef);
  };

  // Gets the state key of an address
  const getAccountStateKey = (chain: ChainID, address: string, key: string) =>
    accountStateRef.current?.[chain]?.[address]?.[key] || undefined;

  return (
    <AccountStateContext.Provider
      value={{
        setAccountStateKey,
        getAccountStateKey,
      }}
    >
      {children}
    </AccountStateContext.Provider>
  );
};
