// Copyright 2023 @paritytech/polkadot-live authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { setStateWithRef } from '@polkadot-cloud/utils';
import { AnyJson } from '@polkadot-live/types';
import { useContext, createContext, useState, useRef } from 'react';
import { ChainID } from '@polkadot-live/types/chains';
import { AccountState, AccountStateContextInterface } from './types';
import { defaultAccountState } from './defaults';

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
